---
description: Re-review a branch after the author pushed fixes for a previous /engineer-review. Pulls the branch, verifies each prior finding against the actual code, reports resolved / partial / open / new, and drafts the follow-up message to send the author. Usage: /re-review [base] [nopull|help]
argument-hint: "[base-branch] [nopull | help]"
---

# Re-review (engineer review, round N)

The user already ran `/engineer-review` on this branch, sent you (the reviewer's) notes to the
branch author, and the author has now pushed changes. Your job is to pull those changes and
answer three questions:

1. **Which prior findings are actually fixed?**
2. **Did the fixes introduce anything new?**
3. **What is still open?**

Then draft the follow-up message the user will send back to the author.

You are replacing this typed-out prompt:

> "I sent your notes to <author>. I pulled <author>'s changes. Tell me which issues got
> resolved, if any issues were created, what issues remain."

## Parse arguments

The user passed: `$ARGUMENTS`

Treat `$ARGUMENTS` as whitespace-separated tokens, in any order, case-insensitive:

- If any token is `help`, print the **Usage** section verbatim and stop.
- If any token is `nopull`, `no-pull`, or `local`, set **NOPULL=true** (do not touch the
  working tree; review whatever is checked out right now).
- Of the remaining tokens, the first is the base branch. Default `main`. Verify with
  `git rev-parse --verify <base>`; if it does not exist, say so and stop.

## Usage

```
/re-review                Re-review current branch vs main after the author pushed fixes.
/re-review <branch>       Re-review current branch vs <branch>.
/re-review nopull         Re-review without fetching/fast-forwarding.
/re-review help           Show this usage.
```

---

## Step 1 - Establish who and what

Run in parallel:

- `git rev-parse --abbrev-ref HEAD` - current branch.
- `git rev-parse HEAD` - current local SHA (call this **LOCAL_BEFORE**).
- `git status --porcelain` - working tree state.

Derive:

- **AUTHOR** = the segment of the branch name before the first `/` (e.g. `Seth`, `Alex`).
  If the branch has no `/`, fall back to the most frequent `git log -20 --format=%an` name on
  the branch. Use this name in the report and in the drafted follow-up message. Do not guess
  the author's pronouns - use they/them.

If `git status --porcelain` is non-empty, **stop and tell the user** before pulling. Do not
stash, reset, or discard anything.

## Step 2 - Make sure you have the author's latest

**The user has almost certainly already pulled before invoking this command - that is their
normal workflow.** So "local is already up to date with origin" is the *expected* state, not
a problem, and it does **not** mean there is nothing to review. What you review is
`BASELINE_SHA..HEAD` (step 3), which is completely independent of whether a fetch moves
anything. Never conclude "nothing new was pushed" from `local == remote`.

Skip this entire step if **NOPULL=true**.

```
git fetch origin <branch>
```

Then compare:

- `git rev-parse origin/<branch>` -> **REMOTE_HEAD**
- `git rev-list --count HEAD..origin/<branch>` -> commits the remote has that you do not

Decision table:

- **Local == remote:** normal. The user already pulled. Say nothing about it and continue.
- **Local strictly behind (fast-forwardable):** run `git merge --ff-only origin/<branch>`.
  Also normal - the user forgot, or the author pushed again just now.
- **Local has commits the remote does not:** stop. Report the divergence and ask how to
  proceed. Never force-reset or rebase someone else's branch without being asked.

Record **NEW_HEAD** = `git rev-parse HEAD` after this step.

## Step 3 - Recover the previous review baseline

You need **BASELINE_SHA**: the commit the last review was run against. Try these in order and
say which one you used:

1. **State file.** Read `~/.claude/review-state/sandbox__<branch-slug>.json` (slug =
   branch name with `/` replaced by `__`). This command writes that file at the end of every
   run, so a second `/re-review` always has it.
2. **This conversation.** If a prior `/engineer-review` or `/re-review` report is in the
   current context, use the SHA and findings list from it.
3. **Ask.** Show `git log --oneline <base>..HEAD` and ask the user which commit was the last
   thing you reviewed. Offer the most likely candidate (the commit just before the first
   commit authored after the review, or whose message mentions review/fix/PR feedback) but do
   not assume - a wrong baseline makes the whole report wrong.

Two sanity checks before you go further:

- **`BASELINE_SHA` unreachable** (`git cat-file -t <sha>` fails) - the author force-pushed and
  rewrote history. Say so, and fall back to asking the user which commit to diff from, or to a
  fresh full `/engineer-review`. Do not silently pick a different baseline.
- **`BASELINE_SHA == NEW_HEAD`** - *this* is the real "nothing new to review" case, not
  anything about origin. The author has not pushed since the last review. Say so plainly and
  stop; do not manufacture a delta.

You also need **PRIOR_FINDINGS**: the numbered findings from the last report, with their
severities. Get them from the state file or from this conversation. If neither has them and
the user cannot supply them, say so and fall back to a fresh full `/engineer-review` instead
of guessing what you previously said.

## Step 4 - Read the delta, then read the files

Gather:

- `git log --oneline BASELINE_SHA..NEW_HEAD` - what the author did.
- `git diff BASELINE_SHA..NEW_HEAD --stat` - scope of the fixes.
- `git diff BASELINE_SHA..NEW_HEAD` - the actual fix diff.
- `git diff <base>...NEW_HEAD --stat` - full branch scope, for context.

**Then read every touched file in full.** Commit messages lie, and a diff hunk does not show
you whether a fix is complete. A finding is only "Resolved" if you have read the current
working-tree code and confirmed the defect is gone - not because a commit says
"fix review comments".

**Line numbers must come from the actual file, never from the diff.** Confirm every
`file.js:LINE` citation via the line-number prefix in **Read** output, or
`grep -n '<unique snippet>' <file>`. Diff hunk headers are meaningless as file locations.
If you cannot confirm a line, cite the symbol name instead.

**Make every citation clickable:** wrap in backticks and use the full repo-relative path
(`` `src/Counter.js:42` ``), never a bare filename. Do not put citations inside Markdown
tables - tables break click-to-open.

## Step 5 - Classify every prior finding

For each finding in PRIOR_FINDINGS, assign exactly one status:

- **Resolved** - you read the code and the defect is gone. Say in one line what the author
  changed.
- **Partially resolved** - the main case is handled but a path you named is still broken, or
  the fix was applied in one place and not the sibling places. Name the specific gap.
- **Not addressed** - the code is unchanged, or changed in a way that does not touch the
  defect.
- **Addressed differently** - the author solved it another way. Say whether their approach
  works. If it does, that is Resolved, not a complaint - do not relitigate a valid fix
  because it is not the fix you proposed.
- **Withdrawn** - on re-reading, your original finding was wrong. Say so plainly in one
  sentence and move on. No apology, no self-criticism.
- **Superseded** - the code the finding pointed at no longer exists.

Only downgrade or drop a finding for a real reason. Equally: do not keep a finding alive to
look consistent, and do not invent new nits to pad the round-2 report.

## Step 6 - Hunt for regressions in the fix diff

Review `BASELINE_SHA..NEW_HEAD` as its own change, against the same categories as
`/engineer-review`:

- **Code quality / bugs / logic** (primary). Broken logic, mishandled edge cases,
  inconsistency with surrounding patterns, dead code left behind by the fix.
- **React correctness.** Direct state mutation, missing or wrong `useEffect` dependency
  arrays, missing cleanup in effects, stale closures, missing `key` props, conditional
  hooks - a hurried fix breaks these more often than anything else.
- **JavaScript pitfalls.** `==` vs `===`, unhandled promise rejections, truthiness bugs
  (`0`, `''` treated as absent).
- **Performance.** Unnecessary re-renders, heavy work in render paths. Only if the impact is
  meaningful or the fix is trivial.
- **Security.** Real vulnerabilities only - XSS (especially `dangerouslySetInnerHTML`),
  secrets in code, unvalidated input reaching the DOM or a request.
- **Collateral damage.** Did the fix change behaviour for a caller the finding did not
  mention? Did it touch a shared module (`src/index.js`, shared components, workflow files)
  that other parts import or depend on?

Give new findings numbers that continue from the prior report (if round 1 ended at 16, the
first new one is 17) so the numbering stays stable across rounds and the author can refer to
"finding 4" without ambiguity.

## Step 7 - Produce the report

Output this structure, nothing before it:

```
## Re-review: <branch> vs <base> (round <N>)
**Author:** <AUTHOR>
**Baseline:** <BASELINE_SHA short> -> <NEW_HEAD short> (<N> new commits, +X / -Y)
**Baseline source:** <state file | this conversation | user-confirmed>

### What the author changed
<2-4 sentences, plain English. What they went after and what they left alone.>

### Verdict
<One line. e.g. "3 of 4 blockers resolved, 1 partial, 2 new majors introduced -- not ready."
 or "All blockers and majors resolved, nothing new -- ready to merge.">

### Resolved
- **#N** <short title> - <one line: what they changed, and that you verified it in the file.>

### Partially resolved
- **#N** <short title> - `path/to/file.js:LINE`
  <What is fixed, and precisely what gap remains.>

### Still open
- **#N** [Severity] <short title> - `path/to/file.js:LINE`
  <One line restating why it matters. Do not re-paste the whole round-1 writeup.>

### Withdrawn / superseded
- **#N** <short title> - <one line why.>

### New findings
#### Blocker
N. **[Category]** `path/to/file.js:LINE` - <short title>
   <2-5 sentences: what is wrong, why it matters, what to do.>

#### Major
...
#### Minor
...
#### Nit
...

### Message for <AUTHOR>
<A copy-pasteable block the user can send straight to the author. Markdown. Keep it short and
 concrete: thank them for the fixes that landed, then a bullet per still-open and new item
 with file:line and what to change. No severity jargon they have to decode -- say
 "must fix before merge" rather than "Blocker". Put it in a fenced code block so it copies
 cleanly.>

### Next
Pick a finding number to discuss, say "walk me through them", or say "draft the reply" to
iterate on the message above.
```

If a section is empty, write `_none_` under the heading rather than dropping the heading -
"no new findings" is itself a result the user wants to see stated.

Severity meanings (unchanged from `/engineer-review`):

- **Blocker** - must fix before merge. Real bug or security hole.
- **Major** - should fix. Likely bug or meaningful perf regression.
- **Minor** - worth considering. Clarity, consistency, robustness.
- **Nit** - optional polish.

## Step 8 - Save state for the next round

Write `~/.claude/review-state/sandbox__<branch-slug>.json`:

```json
{
  "branch": "<branch>",
  "base": "<base>",
  "author": "<AUTHOR>",
  "round": <N>,
  "reviewed_sha": "<NEW_HEAD>",
  "reviewed_at": "<YYYY-MM-DD>",
  "findings": [
    {"n": 1, "severity": "blocker", "title": "...", "status": "open|resolved|partial|withdrawn|superseded", "file": "src/...js", "line": 42}
  ]
}
```

Create the `review-state` directory if it does not exist. Carry forward every finding from
prior rounds with its latest status - the file is the running ledger, so round 3 can tell the
user "this has been open since round 1."

Use today's date from context for `reviewed_at`; do not shell out for it.

Then **stop and wait**. Do not start proposing patches.

## Hard constraints

- **Never start the dev server** (`npm start`) or run `npm install` unless the user asks.
- **Do not run tests** unless the user asks; if asked, use `npm test -- --watchAll=false`.
- **Never force-push, reset, rebase, or stash** on someone else's branch. Fetch and
  fast-forward only.
- **Never push to `main`**, and never merge a PR into it, unless the user explicitly asks.
- **Edit policy depends on branch ownership** (the segment before the first `/`):
  - Branch starts with `Seth` (case-insensitive) - the user's own. Edits allowed once they
    pick findings to fix.
  - Any other prefix (`Alex/`, ...) - **do not modify any file**, even after the user
    picks a finding to discuss, **unless they explicitly ask you to make the change.**
    Proposing diffs in chat is fine; writing to files is not.
- Follow everything in root `CLAUDE.md`.
