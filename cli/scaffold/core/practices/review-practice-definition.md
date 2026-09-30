---
title: Review Practice Definition
type: practice
---

# Review Practice Definition

> Judge whether every criterion in a practice definition is one a reviewer can decide only by reading and understanding the target.

## Objective

A practice is inlined into its expert's compiled profile, and the reviewer checks each governed file against it. Praxis holds the standards a linter cannot: if you can write the check, write the check; if you can only describe the standard, write the practice. A practice that carries mechanical criteria asks the reviewer to be a worse linter; one that states bare rules without the why, the boundary case, or an example leaves the reviewer to guess at the standard.

## Process

1. Read each criterion and ask whether a regex, an AST query, or a type check could decide it. If so, it is a lint rule.
2. Read each criterion for its frame: is the why stated beside the what?
3. Look for the boundary case and the negative constraint: what is acceptable, what is not, what is forbidden.
4. Read the wording for severity: binding words for required criteria, advisory words for optional ones.
5. Check that examples live in the prose, not as pointers to live files.
6. Report each finding with the criterion it applies to.

## Criteria

- [ ] **Every criterion is a judgment.** A criterion a regex, an AST query, or a type check could decide with no false positives is a lint rule, not a practice criterion. The tests: could two senior engineers ever disagree on a verdict? Does it turn on meaning — descriptive, complete, justified, belongs — rather than on presence? A criterion that mixes a mechanical half with a judgment half keeps the judgment half alone.
- [ ] **The why is stated alongside the what.** "Error messages are written for the API consumer" gives the reviewer the reading frame; "error messages are descriptive" does not.
- [ ] **The boundary case is shown.** "'rating must be a whole number from 1 to 5' is acceptable; 'invalid input' is not" is one sentence and calibrates more than a paragraph.
- [ ] **What is not allowed is stated.** Negative constraints are flagged as reliably as missing qualities, and only if they are written down.
- [ ] **Binding and advisory language are used on purpose.** "Must", "never", "always" read as required and fail a target; "should", "prefer", "recommended" read as optional and warn. The severity of every criterion is set by its wording.
- [ ] **Examples live in the prose, frozen with the criterion they illustrate.** A pointer to a live file as the good example drifts the first time that file is edited; a short example written into the practice changes only when the practice does.

"Exports a function named `run`" is a lint rule. "Does one thing; a second responsibility is a second service" is a practice criterion. "Has a `description` field" is a lint rule. "The description says when to reach for this, not just what it is" is a practice criterion.
