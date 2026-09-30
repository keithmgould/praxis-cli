---
title: Review Practice Definition
type: practice
---

# Review Practice Definition

> Judge whether every criterion in a practice definition is one a reviewer can decide only by reading and understanding the target.

## Objective

A practice is inlined into its expert's compiled profile, and the reviewer checks each governed file against it. Praxis holds the standards a linter cannot: if you can write the check, write the check; if you can only describe the standard, write the practice. A practice carrying mechanical criteria asks the reviewer to be a worse linter; one stating bare rules leaves it to guess at the standard.

## Process

1. Read each criterion and ask whether a regex, an AST query, or a type check could decide it. If so, it is a lint rule.
2. Read each criterion for its frame: is the why stated beside the what?
3. Look for the boundary case and the negative constraint: what is acceptable, what is not, what is forbidden.
4. Read the wording for severity: binding words for required criteria, advisory words for optional ones.
5. Check that examples live in the prose, not as pointers to live files.
6. Report each finding with the criterion it applies to.

## Criteria

- [ ] **Every criterion is a judgment.** If a regex, AST query, or type check could decide it with no false positives, it is a lint rule; if two senior engineers could never disagree on a verdict, it is not a criterion. "Exports a function named `run`" is lint; "does one thing; a second responsibility is a second service" is a criterion.
- [ ] **The why is stated alongside the what.** "Error messages are written for the API consumer" gives the reviewer a reading frame; "error messages are descriptive" does not.
- [ ] **The boundary case is shown.** "'rating must be a whole number from 1 to 5' is acceptable; 'invalid input' is not" calibrates more in one sentence than a paragraph of rules.
- [ ] **What is not allowed is stated.** Negative constraints are flagged as reliably as missing qualities, but only when written down.
- [ ] **Binding and advisory language are used on purpose.** "Must" and "never" fail a target; "should" and "prefer" warn. Severity is set by wording, so wording is a decision.
- [ ] **Examples live in the prose, frozen with the criterion they illustrate.** A pointer to a live file drifts the first time that file is edited; an example written here changes only when the practice does.
