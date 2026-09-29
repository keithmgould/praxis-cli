When to use: when `.praxis/ledger/runs/` has grown to hundreds or
thousands of files. Every command that reads the ledger opens all of
them, and a run file is typically smaller than one disk block, so the
partition costs far more than the evidence in it. Safe to run any time;
running it on an already-folded ledger does nothing.

Behavior:
  Folds every run file into one archive,
  `.praxis/ledger/runs/<id>-compacted.jsonl`, stamped with the moment
  it was written, and removes the files it folded. Records are moved,
  never changed: the bytes appended to the archive are each source
  file's own, in the order they were written, so every run and every
  critique survives byte-identical. This is a layout change, not a
  retention policy — nothing is dropped, summarized, or aged out, and
  the ledger reads exactly the same afterwards.

  A file holding no run record is left where it is. The verdict cache
  is untouched; that is `eval prune`.

  The archive is named for when it was made, not for what it holds, so
  two contributors who compact independently write two differently
  named files that merge with no conflict. The history they both carry
  is not counted twice: a run and a critique are identified by their
  ids, and the readers take the first copy of each.

  Compaction rewrites committed files. Run it on a clean tree and
  commit the result on its own.

Examples:
  $ praxis eval compact
      Compacted 1126 run file(s) into 1; 1126 run(s) kept

  $ praxis eval compact
      Nothing to compact — the ledger is already compact

Next:
  praxis eval report    — reads the ledger; unchanged by compaction
  praxis eval prune     — the cache's cleanup, not the ledger's

Docs: https://zarpay.github.io/praxis-cli/commands/eval
