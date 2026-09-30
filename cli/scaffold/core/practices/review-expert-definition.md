---
title: Review Expert Definition
type: practice
---

# Review Expert Definition

> Judge whether an expert definition tells a reviewer which files it judges and why, without carrying the criteria that belong to its practices.

## Objective

An expert definition is the frame a reviewer works inside: who it reads as, what that reader cares about, and which files are in scope. A definition vague about scope makes the reviewer invent standards; one that restates its practices' criteria makes it read them twice. Judge the file in front of you on those two counts.

## Process

1. Read the `description` for a trigger, and `validates:` for a scope that matches what the body says the expert judges.
2. Read the body for the frame it gives, and for anything that is a criterion or a lint rule instead.
3. Report each finding with the sentence it applies to.

## Criteria

- [ ] **The description says when to invoke this expert, not just what it is.** A job with no trigger fails: "reviews the runbooks" alone is a job; "invoke when a file under `docs/runbooks/` changes" gives the harness its cue.
- [ ] **An expert that reviews declares `validates:` matching what the body says it judges.** Wider, and the reviewer fills the gap with invented criteria; narrower, and coverage is silently lost. An expert people only consult declares none.
- [ ] **Files out of scope are listed under `excludes:`, never as "except for X" in the body.** A file excluded in frontmatter is one the reviewer never sees; an exclusion in prose can be missed. Saying what the expert judges is not an exclusion.
- [ ] **The body states the why alongside the what.** A bare rule invites literalism: "documents must be current" is a rule; "a reader who was not there when the system was built has only this document" is a frame.
- [ ] **The body gives the frame and never restates a practice's criteria.** A criterion in both is read twice and drifts, so a body that carries its practice's bullet list must fail: one ending "...asks whether the description alone tells them what will change, what the edges do, and what else has to move with it" has copied three criteria into the frame, while "...asks whether they would be surprised by what happens next" leaves them to the practice.
- [ ] **Nothing in the body is what a linter already enforces.** Mechanical criteria are outside the reviewer's scope even where stated; "every service exports `run`" in the body only dilutes the frame for the human reader.
