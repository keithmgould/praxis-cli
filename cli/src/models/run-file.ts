import type { LedgerCritiqueRecord, LedgerRecord, LedgerRunRecord } from "@/types.js";

/**
 * One run file's format: run records, each followed by its critique
 * records, one JSON object per line.
 *
 * A freshly written file holds exactly one run — the write-once shape.
 * A compacted file holds many, in the order they were written. Both are
 * the same format read the same way: the file is a sequence of records,
 * and every record carries the `run_id` that places it.
 *
 * Parsing is tolerant the way evidence reading must be: a file with no
 * run record in it is not a run file (null), and a malformed line loses
 * one record, never the file. The store owns the IO; this model owns
 * the bytes.
 */
export class RunFile {
  private readonly runRecords: LedgerRunRecord[];

  private readonly lines: string[];

  private constructor(runRecords: LedgerRunRecord[], lines: string[]) {
    this.runRecords = runRecords;
    this.lines = lines;
  }

  /** Parses a run file's content, or null when it is not one. */
  static fromContent(content: string): RunFile | null {
    const lines = content.split("\n");
    const runRecords: LedgerRunRecord[] = [];

    for (const line of lines) {
      if (!line.includes('"run"')) continue;

      try {
        const record = JSON.parse(line) as LedgerRunRecord;

        if (record.kind === "run") runRecords.push(record);
      } catch {
        // One malformed line loses one record, never the file.
      }
    }

    return runRecords.length === 0 ? null : new RunFile(runRecords, lines);
  }

  /** One run's records as its file content — the write-once shape. */
  static serialize(records: LedgerRecord[]): string {
    return records.map((record) => JSON.stringify(record)).join("\n") + "\n";
  }

  /** The run records, in file order; malformed lines skipped. */
  runs(): LedgerRunRecord[] {
    return this.runRecords;
  }

  /** The critique records, in file order; malformed lines skipped. */
  critiques(): LedgerCritiqueRecord[] {
    const critiques: LedgerCritiqueRecord[] = [];

    for (const line of this.lines) {
      if (!line.includes('"critique"')) continue;

      try {
        const record = JSON.parse(line) as LedgerCritiqueRecord;

        if (record.kind === "critique") critiques.push(record);
      } catch {
        // One malformed line loses one record, never the file.
      }
    }

    return critiques;
  }
}
