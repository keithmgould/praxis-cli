import { describe, expect, it } from "vitest";

import { RunFile } from "@/models/run-file.js";
import { critiqueLine } from "@tests/helpers/ledger-runs.js";

const RUN_LINE = JSON.stringify({ kind: "run", run_id: "r1", reviewer_name: "flash" });
const SECOND_RUN_LINE = JSON.stringify({ kind: "run", run_id: "r2", reviewer_name: "v32" });

describe("RunFile", () => {
  it("parses the run record and the critiques beneath it", () => {
    const content = [RUN_LINE, critiqueLine({ runId: "r1", seq: 1 })].join("\n") + "\n";

    const file = RunFile.fromContent(content);

    expect(file?.runs().map((run) => run.run_id)).toEqual(["r1"]);
    expect(file?.critiques().map((critique) => critique.id)).toEqual(["r1:1"]);
  });

  it("parses every run in a compacted file, in file order", () => {
    const content =
      [
        RUN_LINE,
        critiqueLine({ runId: "r1", seq: 1 }),
        SECOND_RUN_LINE,
        critiqueLine({ runId: "r2", seq: 1 }),
      ].join("\n") + "\n";

    const file = RunFile.fromContent(content);

    expect(file?.runs().map((run) => run.run_id)).toEqual(["r1", "r2"]);
    expect(file?.critiques().map((critique) => critique.id)).toEqual(["r1:1", "r2:1"]);
  });

  it("is not a run file when no line is a run record", () => {
    expect(RunFile.fromContent("not json\n")).toBeNull();
    expect(RunFile.fromContent(critiqueLine({ runId: "r1" }) + "\n")).toBeNull();
  });

  it("loses a malformed critique line, never the file", () => {
    const content = [RUN_LINE, "garbage {", critiqueLine({ runId: "r1", seq: 2 })].join("\n");

    const file = RunFile.fromContent(content);

    expect(file?.critiques()).toHaveLength(1);
  });

  it("loses a malformed run line, never the runs around it", () => {
    const content = [RUN_LINE, '{"kind":"run", oops', SECOND_RUN_LINE].join("\n");

    const file = RunFile.fromContent(content);

    expect(file?.runs().map((run) => run.run_id)).toEqual(["r1", "r2"]);
  });

  it("serializes records to the write-once shape, one line each", () => {
    const serialized = RunFile.serialize([{ kind: "run", run_id: "r1" } as never]);
    const lineWithoutName = RUN_LINE.replace(',"reviewer_name":"flash"', "") + "\n";

    expect(serialized).toBe(lineWithoutName);
  });
});
