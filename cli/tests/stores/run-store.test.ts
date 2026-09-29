import { randomUUID } from "node:crypto";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { RunStore } from "@/stores/run-store.js";
import { critiqueLine, seedLedgerRun } from "@tests/helpers/ledger-runs.js";
import { testConfig } from "@tests/helpers/test-config.js";

describe("RunStore", () => {
  let root: string;
  let store: RunStore;

  beforeEach(() => {
    root = join(tmpdir(), `praxis-run-store-test-${randomUUID()}`);
    mkdirSync(root, { recursive: true });
    store = new RunStore(testConfig(root));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  const RUN_LINE = JSON.stringify({ kind: "run", run_id: "r1", reviewer_name: "flash" });
  const COMPACTED = /^\d{8}T\d{9}Z-[0-9a-f]{8}-compacted\.jsonl$/;
  const EARLY = "2026-09-02T10:00:00.000Z";
  const LATE = "2026-09-20T10:00:00.000Z";

  /** The runs partition's filenames, sorted. */
  function archiveNames(): string[] {
    return readdirSync(join(root, ".praxis", "ledger", "runs")).sort();
  }

  /** Writes one raw file into the runs directory, however malformed. */
  function seedRawFile(name: string, content: string): void {
    const dir = join(root, ".praxis", "ledger", "runs");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, name), content);
  }

  describe("mintRunId", () => {
    it("mints sortable, collision-safe ids", () => {
      const first = store.mintRunId();
      const second = store.mintRunId();

      expect(first).toMatch(/^\d{8}T\d{9}Z-[0-9a-f]{8}$/);
      expect(second).not.toBe(first);
    });
  });

  describe("runs", () => {
    it("returns nothing for a project with no ledger", () => {
      expect(store.runs()).toEqual([]);
    });

    it("returns each file's run record, never its critique records", () => {
      seedLedgerRun(root, {
        name: "flash",
        hash: "aaaa1111",
        extraLines: [critiqueLine({ runId: "r1", seq: 1 })],
      });
      seedLedgerRun(root, { name: "v32", hash: "bbbb2222" });

      const runs = store.runs();
      const names = runs.map((run) => run.reviewer_name).sort();

      expect(names).toEqual(["flash", "v32"]);
      expect(runs.every((run) => run.kind === "run")).toBe(true);
    });

    it("skips a corrupt file without losing the readable ones", () => {
      seedRawFile("corrupt.jsonl", "not json at all\n");
      seedLedgerRun(root, { name: "flash", hash: "aaaa1111" });

      const names = store.runs().map((run) => run.reviewer_name);

      expect(names).toEqual(["flash"]);
    });

    it("counts a run once when two merged archives both carry it", () => {
      const shared = JSON.stringify({ kind: "run", run_id: "r1", reviewer_name: "flash" });
      seedRawFile("a-compacted.jsonl", shared + "\n");
      seedRawFile("b-compacted.jsonl", shared + "\n");

      const ids = store.runs().map((run) => run.run_id);

      expect(ids).toEqual(["r1"]);
    });

    it("skips a file with no run record in it", () => {
      seedRawFile("odd.jsonl", critiqueLine({ runId: "x", seq: 1 }) + "\n");

      expect(store.runs()).toEqual([]);
    });
  });

  describe("critiques", () => {
    it("returns every critique line across run files, sorted by id", () => {
      seedLedgerRun(root, {
        name: "flash",
        hash: "aaaa1111",
        extraLines: [critiqueLine({ runId: "r1", seq: 2 }), critiqueLine({ runId: "r1", seq: 1 })],
      });

      const ids = store.critiques().map((critique) => critique.id);

      expect(ids).toEqual(["r1:1", "r1:2"]);
    });
  });

  describe("critiques", () => {
    it("counts a critique once when two merged archives both carry it", () => {
      const line = critiqueLine({ runId: "r1", seq: 1 });
      seedRawFile("a-compacted.jsonl", RUN_LINE + "\n" + line + "\n");
      seedRawFile("b-compacted.jsonl", RUN_LINE + "\n" + line + "\n");

      const ids = store.critiques().map((critique) => critique.id);

      expect(ids).toEqual(["r1:1"]);
    });
  });

  describe("writeRun", () => {
    it("lands the records as one run file, named by the id", () => {
      const runId = store.mintRunId();

      const { path } = store.writeRun(runId, [{ kind: "run", run_id: runId } as never]);

      expect(path).toBe(join(root, ".praxis", "ledger", "runs", `${runId}.jsonl`));
      expect(store.runs()).toHaveLength(1);
    });
  });

  describe("compact", () => {
    it("folds the run files into one stamped archive, records unchanged", () => {
      seedLedgerRun(root, {
        name: "flash",
        hash: "aaaa1111",
        runId: "r1",
        timestamp: "2026-09-02T10:00:00.000Z",
        extraLines: [critiqueLine({ runId: "r1", seq: 1 })],
      });
      seedLedgerRun(root, {
        name: "v32",
        hash: "bbbb2222",
        runId: "r2",
        timestamp: "2026-09-14T10:00:00.000Z",
      });
      const before = store.runs();

      const result = store.compact();

      expect(result).toEqual({ filesBefore: 2, filesAfter: 1, runsCompacted: 2 });
      expect(archiveNames()).toEqual([expect.stringMatching(COMPACTED)]);
      expect(store.runs()).toEqual(before);
      expect(store.critiques().map((critique) => critique.id)).toEqual(["r1:1"]);
    });

    it("spans calendar months — the archive is stamped, not dated by content", () => {
      seedLedgerRun(root, { name: "flash", hash: "a", timestamp: "2026-09-30T10:00:00.000Z" });
      seedLedgerRun(root, { name: "flash", hash: "a", timestamp: "2026-10-01T10:00:00.000Z" });

      store.compact();

      expect(archiveNames()).toEqual([expect.stringMatching(COMPACTED)]);
      expect(store.runs()).toHaveLength(2);
    });

    it("folds new runs into a fresh archive alongside the old one", () => {
      seedLedgerRun(root, { name: "flash", hash: "a", runId: "r1", timestamp: EARLY });
      store.compact();
      seedLedgerRun(root, { name: "flash", hash: "a", runId: "r2", timestamp: LATE });

      const result = store.compact();

      expect(result.filesAfter).toBe(1);
      expect(archiveNames()).toEqual([expect.stringMatching(COMPACTED)]);
      expect(store.runs().map((run) => run.run_id)).toEqual(["r1", "r2"]);
    });

    it("reports nothing to compact when the ledger is already one file", () => {
      seedLedgerRun(root, { name: "flash", hash: "a", timestamp: EARLY });

      const result = store.compact();

      expect(result).toEqual({ filesBefore: 1, filesAfter: 1, runsCompacted: 0 });
      expect(archiveNames()).toHaveLength(1);
    });

    it("leaves a file that is not a run file exactly where it is", () => {
      seedRawFile("corrupt.jsonl", "not json at all\n");
      seedLedgerRun(root, { name: "flash", hash: "a", runId: "r1", timestamp: EARLY });
      seedLedgerRun(root, { name: "flash", hash: "a", runId: "r2", timestamp: LATE });

      store.compact();

      expect(archiveNames()).toEqual([expect.stringMatching(COMPACTED), "corrupt.jsonl"]);
    });

    it("does nothing to a project with no ledger", () => {
      expect(store.compact()).toEqual({ filesBefore: 0, filesAfter: 0, runsCompacted: 0 });
    });
  });

  describe("hasCorpusRun", () => {
    it("answers by set membership: any corpus run under the hash, ever", () => {
      seedLedgerRun(root, { name: "flash", runId: "r1", hash: "aaaa1111", scope: "corpus" });
      seedLedgerRun(root, { name: "flash", runId: "r2", hash: "bbbb2222", scope: "files" });

      expect(store.hasCorpusRun("aaaa1111")).toBe(true);
      expect(store.hasCorpusRun("bbbb2222")).toBe(false);
      expect(store.hasCorpusRun("cccc3333")).toBe(false);
    });
  });
});
