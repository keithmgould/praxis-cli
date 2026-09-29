---
title: Review Expert Definition
type: practice
---

# Review Expert Definition

> Handed this expert's compiled profile as its only instruction, would a reviewer know exactly which files it judges, and why?

An expert compiles into a profile that is both an agent and a spec: `praxis eval run` reviews the files under `validates:` against the profile's text. Read the definition as that reviewer.

- **The description says when to reach for this expert, not just what it is.** It is the sentence a harness reads to decide whether to invoke the agent. "Use this agent to review services for convention adherence" describes a job; "invoke when files under `src/services/` are added or changed" tells the harness when.
- **`validates:` names exactly the files the practices judge.** A practice about a field's prose points at the files that carry the field; a practice about a directory's shape points at the directory. Wider than the judgment, and the reviewer fills the gap with criteria the spec never stated; narrower, and coverage is given up silently. Files that are out of scope are listed under `excludes:` in the frontmatter, never as "except for X" in the prose — an exclusion in prose is an instruction the reviewer can fail to apply.
- **The body states the why alongside the what.** "Error messages are written for the API consumer" gives the reviewer a reading frame; a bare list of rules invites literalism. The expert says who the reviewer is standing in for and what that reader cares about; the practices carry the criteria.
- **The body gives the frame and leaves the criteria to the practices.** The compiler inlines every declared practice into the expert's profile, so the reviewer reads the Expert section and the Practices section as one instruction. A criterion that appears in both reaches the reviewer twice, and the two copies drift apart the next time only one is edited. The expert says who the reader is and what they care about; what would make a file fall short is the practice's sentence, not the expert's. An expert with a single practice will naturally share that practice's question, and that is fine. Sharing its bullet list is not.
- **Nothing in the body is what a linter already enforces.** The reviewer is told to ignore mechanical criteria even where the spec states them, so a naming pattern or a required field in the expert text dilutes the spec for the human reader and does nothing for the reviewer.

An expert whose body reads "Reviews services. Services must export `run`, live under `src/services/`, and handle errors" fails on the last two points: two of three rules are lint, and the reviewer is given no frame for the third. The same expert reading "the next reader of a service, human or agent, should already know how to read it before opening the file" gives the reviewer the frame and leaves the rules to the practice.

An expert whose body ends "...and asks whether the description alone tells them what will change, what the edges do, and what else has to move with it" has copied its practice's three criteria into the frame. The same body ending "...and asks whether they would be surprised by what happens next" gives the reader and the question, and leaves the three criteria where the reviewer will read them once.
