---
title: Review Expert Definition
type: practice
---

# Review Expert Definition

> Judge whether an expert definition, compiled and handed to a reviewer as its only instruction, tells that reviewer which files it judges and why.

## Objective

An expert compiles into a profile that is both an agent and a spec: `praxis eval run` reviews the files under `validates:` against the profile's text. A definition vague about its scope, or carrying its practices' criteria in its own body, produces a reviewer that invents standards or weights them twice. Read every expert definition as that reviewer.

## Process

1. Read the `description` as a harness would: does it say when to invoke this agent?
2. Read `validates:` and `excludes:` against the declared practices: do the globs name exactly the files those practices judge?
3. Read the body for the frame it gives the reviewer: who it stands in for, and what that reader cares about.
4. Read the body for anything that belongs elsewhere: a practice's criteria, or a rule a linter already enforces.
5. Report each finding with the sentence it applies to.

## Criteria

- [ ] **The description says when to invoke this expert, not just what it is.** A harness reads it to decide whether to load the agent, so a job with no trigger fails: "reviews services for convention adherence" alone is a job; adding "invoke when files under `src/services/` change" gives the harness its cue.
- [ ] **An expert that reviews declares `validates:` naming exactly the files its practices judge.** Wider, and the reviewer fills the gap with invented criteria; narrower, and coverage is silently lost. An expert people only consult, with no files to review, declares none.
- [ ] **Files out of scope are listed under `excludes:`, never as "except for X" in the body.** A file excluded in frontmatter is one the reviewer never sees; an exclusion in prose is an instruction it can fail to apply. Saying what the expert judges is not an exclusion.
- [ ] **The body states the why alongside the what.** A bare rule invites literalism. "Services must handle errors" is a rule; "the next reader of a service should already know how to read it before opening the file" is a frame.
- [ ] **The body gives the frame and never restates a practice's criteria.** Practices are inlined into the profile, so a criterion in both is read twice and drifts. Sharing the practice's question is fine; a body that carries its bullet list must fail: one ending "...asks whether the description alone tells them what will change, what the edges do, and what else has to move with it" has copied three criteria into the frame, while "...asks whether they would be surprised by what happens next" leaves them to the practice.
- [ ] **Nothing in the body is what a linter already enforces.** The reviewer is told to ignore mechanical criteria even where the spec states them; "services export `run`" in the body only dilutes the spec for the human reader.
