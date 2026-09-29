import type { Orchestrator } from "@/types.js";

import { prepareOrchestrator } from "@/helpers/prepare-orchestrator-helper.js";
import { RunStore } from "@/stores/run-store.js";
import compactView from "@/views/compact-view.js";

/**
 * What `praxis eval compact` does: fold the ledger's run files into one
 * archive — the same records, in far fewer files.
 *
 * Nothing is dropped, summarized, or rewritten. One file per run is
 * what keeps concurrent runs conflict-free while they are being
 * written; once history is sealed, that file count is pure cost — a
 * block of disk apiece and an open apiece on every command that reads
 * the ledger.
 */
export const compactLedgerOrchestrator: Orchestrator = async (ctx) => {
  const store = new RunStore(ctx.config);
  const result = store.compact();

  const view = compactView(result);
  ctx.render(view);

  return "ok";
};

export default prepareOrchestrator(compactLedgerOrchestrator);
