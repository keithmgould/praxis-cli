import type { PraxisConfig } from "@/models/praxis-config.js";
import type {
  CompactLedgerResult,
  LedgerCritiqueRecord,
  LedgerRecord,
  LedgerRunRecord,
  WriteLedgerRunResult,
} from "@/types.js";

import {
  exists,
  listFilesRecursive,
  readText,
  removeFile,
  writeText,
} from "@/helpers/files-helper.js";
import { sortableId } from "@/helpers/id-helper.js";
import { joinPath } from "@/helpers/paths-helper.js";
import { RunFile } from "@/models/run-file.js";

/**
 * The ledger's runs partition: `.praxis/ledger/runs/`, one write-once
 * file per (invocation, reviewer) until `compact` folds sealed history
 * into one `<id>-compacted.jsonl` archive.
 *
 * Reads never raise — a ledger that cannot be fully read must not cost
 * the command that consults it. Writes always raise — an eval store
 * with optional gaps is not an eval store. The file format is
 * `RunFile`; this store owns the layout, the id minting, and the IO.
 */
export class RunStore {
  private readonly runsDir: string;

  constructor(cfg: PraxisConfig) {
    this.runsDir = joinPath(cfg.root, ".praxis", "ledger", "runs");
  }

  /** Sortable, filename-safe, collision-safe — see `sortableId`. */
  mintRunId(): string {
    return sortableId();
  }

  /**
   * Every run record, across all run files, one per run id. Critique
   * lines are never parsed here, so listing stays cheap. Unparseable
   * files are skipped.
   *
   * Deduplication is a merge concern, not an optimization: two branches
   * that each compacted before merging carry the history they share in
   * two archives, and git merges both without a conflict. Counting a
   * run twice would inflate every report, so the first record per id
   * wins — ids come from `sortableId`, which makes a true collision a
   * non-event.
   */
  runs(): LedgerRunRecord[] {
    const runs = this.files()
      .map((path) => {
        const content = readText(path);

        return RunFile.fromContent(content);
      })
      .filter((file): file is RunFile => file !== null)
      .flatMap((file) => file.runs());

    return uniqueById(runs, (run) => run.run_id);
  }

  /**
   * Run ids whose critiques must never reach a queue.
   *
   * `praxis feedback` records everything it finds — the ledger answers
   * what has ever happened — but those critiques describe code in
   * flight, and queueing them would bury the ones about code that
   * landed. The scope is on the run, so the answer is a set of run ids
   * the critique readers filter against.
   */
  advisoryRunIds(): Set<string> {
    const advisory = this.runs().filter((run) => run.scope === "advisory");

    return new Set(advisory.map((run) => run.run_id));
  }

  /**
   * Every critique record, across all run files, one per id, sorted by
   * id. Deduplicated for the same reason `runs` is — merged archives.
   */
  critiques(): LedgerCritiqueRecord[] {
    const critiques = this.files()
      .map((path) => {
        const content = readText(path);

        return RunFile.fromContent(content);
      })
      .filter((file): file is RunFile => file !== null)
      .flatMap((file) => file.critiques());

    const distinct = uniqueById(critiques, (critique) => critique.id);

    return distinct.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Whether any corpus run exists under a behavioral hash — the
   * membership question baseline stamping asks: set membership,
   * not sequence position, so interleaved contributor runs and branch
   * merges cannot flip the answer.
   */
  hasCorpusRun(reviewerHash: string): boolean {
    return this.runs().some((run) => run.reviewer_hash === reviewerHash && run.scope === "corpus");
  }

  /**
   * Lands one run's records as its file: written whole, never touched
   * again — append-only means record immutability, and one file per run
   * keeps concurrent runs and git merges conflict-free.
   *
   * @throws on write failure — a silently missing run is a gap in evidence
   */
  writeRun(runId: string, records: LedgerRecord[]): WriteLedgerRunResult {
    const path = joinPath(this.runsDir, `${runId}.jsonl`);

    writeText(path, RunFile.serialize(records));

    return { runId, path };
  }

  /**
   * Folds the partition's run files into one archive,
   * `<id>-compacted.jsonl`, stamped with the moment it was written.
   *
   * No record is rewritten: each source file's bytes are appended
   * verbatim, in the order the partition already sorts them, and the
   * sources are removed only once the archive carrying them is on disk.
   * One file per run is what keeps concurrent runs conflict-free *while
   * they are being written*; sealed history has no writer left to
   * conflict with, and a thousand files whose median size is a fraction
   * of a block cost a block apiece on disk and an open apiece on every
   * read.
   *
   * The archive takes a minted id rather than a name derived from its
   * contents, so two contributors compacting independently write two
   * differently-named files that merge without a conflict; the shared
   * history they both carry is dropped on read, not here — see `runs`.
   *
   * Files that are not run files are left exactly where they are, and a
   * partition with nothing to fold is left untouched rather than
   * rewritten under a new name.
   *
   * @throws on write failure — evidence is never deleted before its archive lands
   */
  compact(): CompactLedgerResult {
    const filesBefore = this.files().length;
    const sources: string[] = [];
    const contents: string[] = [];
    let runsCompacted = 0;

    for (const path of this.files()) {
      const content = readText(path);
      const file = RunFile.fromContent(content);

      if (file === null) continue;

      sources.push(path);
      contents.push(content.endsWith("\n") ? content : `${content}\n`);
      runsCompacted += file.runs().length;
    }

    // One file is already as folded as it gets; renaming it would churn
    // the bytes and the git history for nothing.
    if (sources.length < 2) {
      return { filesBefore, filesAfter: filesBefore, runsCompacted: 0 };
    }

    const archive = joinPath(this.runsDir, `${this.mintRunId()}-compacted.jsonl`);

    writeText(archive, contents.join(""));

    for (const path of sources) {
      removeFile(path);
    }

    return { filesBefore, filesAfter: this.files().length, runsCompacted };
  }

  /** Absolute paths of every run file in the partition. */
  private files(): string[] {
    if (!exists(this.runsDir)) return [];

    return listFilesRecursive(this.runsDir)
      .filter((file) => file.endsWith(".jsonl"))
      .map((file) => joinPath(this.runsDir, file));
  }
}

/** The first record per id, in encounter order — see `RunStore.runs`. */
function uniqueById<T>(records: T[], idOf: (record: T) => string): T[] {
  const byId = new Map<string, T>();

  for (const record of records) {
    const id = idOf(record);

    if (!byId.has(id)) byId.set(id, record);
  }

  return [...byId.values()];
}
