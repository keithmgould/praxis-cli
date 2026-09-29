import type { CompactLedgerResult } from "@/types.js";
import type { View } from "@framework/types.js";

/** What a compaction reports: what it folded, or that nothing was left to fold. */
const compactView: View<CompactLedgerResult> = ({ filesBefore, filesAfter, runsCompacted }) => {
  if (filesBefore === filesAfter) {
    return [{ channel: "success", text: "Nothing to compact — the ledger is already compact" }];
  }

  return [
    {
      channel: "success",
      text: `Compacted ${filesBefore} run file(s) into ${filesAfter}; ${runsCompacted} run(s) kept`,
    },
  ];
};

export default compactView;
