# Lab Bench step pattern

Every step in every module follows this structure. This is not a style guide — it is the load-bearing pattern that makes the academy work. Skip a section and the step degrades to a tutorial that teaches mechanics without understanding.

## Required fields

- `id` — `s1`, `s2`, etc.
- `title` — short, sentence case ("Environment variables", not "Environment Variables")
- `estimate` — honest execution time. Read the prose + type the things + wait for output + small buffer. NOT "time to master the concept."
- `body` — 1–6 sentences. Weave the "why this matters" into the body itself rather than splitting it into a separate callout. The body should leave the reader understanding what the concept is, why it matters, and what they're about to do — all in flowing prose.
- `verify` — what success looks like. Concrete output or state. Renders in a green "When this works" callout.

## Required for any step with a code block the user must run

- `tryCue` — one-line action prompt that renders directly above the code block as an amber "TRY THIS" badge plus a sentence. Examples: "Run all three. Read the output." / "Type this and press Enter." This exists to make the action visually obvious. Without it, the code block reads as a reference snippet, not an instruction.

## Required when a step has multiple commands or variables to understand

- `commandNotes` — array of `{key, what, when}` objects. One per command or variable in the code block. Renders as a stack of small cards below the code.
  - `what` answers: what is this?
  - `when` answers: when would you actually run this in real life? Not a definition. A bug it diagnoses, a question it answers, a moment it matters.
  - If you can't write a useful `when`, the command probably doesn't need a note. Don't pad.

## Required for any step that teaches a skill (vs. plumbing)

- `whenYoullReachForThis` — 3–6 concrete scenarios where the overall skill from this step matters. Renders below verify in a muted panel. Be specific: "When debugging" is bad. "When `brew install` succeeds but the command isn't found" is good.

## Optional fields

- `code` — the command(s) to run, in a copyable block
- `notes` — bulleted sub-steps when the action has multiple parts
- `trouble` — what to do if it doesn't work; common failure modes
- `tag` / `tagOptional` — for optional steps

## When to OMIT the skill fields

Setup steps that exist only to chain into the next step. Example: "Open iTerm2" doesn't need `tryCue` annotations or scenarios — it's plumbing. But "Install Homebrew" needs them because Homebrew is a skill, not plumbing.

Rule of thumb: if someone could legitimately ask "why am I doing this," the step needs the skill fields. If the answer is "because the next step requires it," the step is plumbing and doesn't.

## Render order in the Lab Bench

1. Step number + estimate (header)
2. Title
3. `body`
4. `tryCue` (amber badge + sentence)
5. `code` block + Copy button
6. `commandNotes` (stack of small cards)
7. `notes` (bulleted sub-steps, if separate from commandNotes)
8. `verify` (green success callout)
9. `whenYoullReachForThis` (muted gray panel)
10. `trouble` (amber warning callout, only if step fails)

## Authoring voice

- Sentence case. Never Title Case.
- Direct, second person. "You'll run X" not "The user runs X."
- No filler. No "In this step we will learn how to..." Just teach the thing.
- Funny is allowed. Cheesy is not.
- Time estimates are honest execution time, not aspirational mastery time. Step 7's `top` + Ctrl+C is 2 minutes, not 20.

## What we deliberately rejected

- A separate "Why this matters" callout. The why goes in the body as prose. A second callout was disjointed and made the action harder to find.
- Splitting commands without explaining each one. If the code has three commands and the body only motivates one, the other two need `commandNotes` or they shouldn't be in the step.
- "Stuck" as a generic button. Replaced with "Question?" which pre-fills the step context so the user can ask specific questions without re-explaining where they are.
