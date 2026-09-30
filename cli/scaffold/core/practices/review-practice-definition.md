---
title: Review Practice Definition
type: practice
---

# Review Practice Definition

> Judge whether every criterion in a practice definition is one a reviewer can decide only by reading and understanding the target.

## Objective

A practice's criteria are what a reviewer holds each governed file to. A criterion a tool could decide sends the reviewer to do a linter's job badly; a bare rule with no why, boundary case, or example leaves it to guess at the standard. Judge each criterion in the file in front of you on those counts.

## Process

1. For each criterion, ask whether a regex, an AST query, or a type check could decide it.
2. Look for the why, the boundary case, the negative constraint, and the severity word.
3. Report each finding with the criterion it applies to.

## Criteria

- [ ] **Every criterion is a judgment.** If a regex, AST query, or type check could decide it with no false positives, or two senior readers could never disagree on a verdict, it is a lint rule. "Has a title" is lint; "the title says what the document is about" is a criterion.
- [ ] **The why is stated alongside the what.** "Error messages are written for the person who hit them" gives a reading frame; "error messages are descriptive" does not.
- [ ] **At least one boundary case is shown.** Somewhere in the practice, an acceptable and an unacceptable case sit side by side: "'rating must be a whole number from 1 to 5' is acceptable; 'invalid input' is not." One such pair calibrates the reviewer; a pair per criterion is not required.
- [ ] **What is not allowed is stated.** A negative constraint is flagged as reliably as a missing quality, but only when written down.
- [ ] **Wording sets severity.** A criterion written as an imperative ("lead with the fact", "keep out progress tables") or with "must", "never", "always" is required, and a violation fails the target. One written with "should", "prefer", or "recommended" is optional, and a violation warns. An imperative needs no further marker; only a criterion that mixes both registers is unclear.
- [ ] **Examples live in the prose, frozen with the criterion they illustrate.** A pointer to a live file drifts the first time that file is edited; an example written here changes only when the practice does.
