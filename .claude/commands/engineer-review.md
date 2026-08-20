---
description: Engineer review of the current branch vs a base (default main). Produces a severity-ranked findings report, then discusses findings one by one. Usage: /engineer-review [base] [help]
argument-hint: "[base-branch] [help]"
---

# Engineer review

You are running an **engineer review** of the current branch against a base branch. The user and you will then discuss findings one by one.

## Parse arguments

The user passed: `$ARGUMENTS`

Treat `$ARGUMENTS` as whitespace-separated tokens, in any order, case-insensitive:

- If any token is `help`, print the **Usage** section below verbatim and stop. Do not run the review.
- Of the remaining tokens, the first (trimmed) is the base branch name. Confirm it exists with `git rev-parse --verify <base>` before proceeding; if it does not, tell the user and stop.
- If no base-branch token remains, use `main`.

## Usage

```
/engineer-review                    Review current branch vs main.
/engineer-review <branch>           Review current branch vs <branch>.
/engineer-review help               Show this usage.
```

## Review procedure

### 1. Gather context (run these in parallel)

- `git rev-parse --abbrev-ref HEAD` to get the current branch name.
- `git log --oneline <base>..HEAD` to list commits on this branch.
- `git diff <base>...HEAD --stat` for scope.
- `git diff <base>...HEAD` for the full diff.
- Read `package.json` and note the React version and scripts. Flag if the diff relies on a dependency that is not declared there.

### 2. Read changed files in full

For each modified file, **Read the whole file**, not just the diff hunks, so you can judge surrounding context. Also read the root `CLAUDE.md` for repo conventions.

**CRITICAL - line numbers must come from the actual file, never from the diff.** A `git diff` (and the line numbers in a saved/persisted diff output) does NOT reflect real file line numbers - hunk headers like `@@ -73,6 +75,11 @@` and the running line count of the diff text are both meaningless as file locations. Before you cite any `file.js:LINE` in the report, confirm the real line number by either:
  - the line-number prefix from the **Read** output of that file, or
  - `grep -n '<a unique snippet from that code>' <file>` run against the working-tree file.
Never copy a line number out of the diff. If you cannot confirm a line, cite the symbol name (component/function) instead of a number.

**Make every file reference clickable.** In the report, each `file:LINE` citation MUST be:
  - wrapped in inline-code backticks (e.g. `` `src/Counter.js:42` ``) - without backticks it will not render as a clickable preview link, and
  - a **full repo-relative path** (e.g. `src/Counter.js:42`), never a bare filename like `Counter.js:42` - bare names do not resolve to a preview.
Do not put these citations inside Markdown tables; tables break the click-to-open behavior. Use a list or inline prose instead.

### 3. Check for issues in these categories

Focus on real problems — do not invent nits to look thorough. If the diff is clean, say so.

- **Code quality / bugs / logic** (primary focus). Broken logic, mishandled edge cases, inconsistency with surrounding patterns, dead code, confusing names.
- **React correctness.** Direct state mutation, missing or wrong `useEffect` dependency arrays, missing cleanup in effects, stale closures, missing `key` props in lists, calling hooks conditionally, derived state that should be computed during render.
- **JavaScript pitfalls.** `==` vs `===` surprises, unhandled promise rejections, accidental globals, off-by-one and truthiness bugs (`0`, `''` treated as absent).
- **Performance.** Unnecessary re-renders (new object/array/function identities passed as props each render), heavy work in render paths, missing memoization only where it demonstrably matters. Skip micro-optimizations.
- **Security.** Real vulnerabilities: XSS (especially `dangerouslySetInnerHTML`), secrets committed to the repo, unvalidated user input reaching the DOM or a request. Do **not** list far-fetched edge cases.
- **Workflow files.** If the diff touches `.github/workflows/`, check triggers, permissions, and secret usage for mistakes that would break or over-privilege a workflow.

### 4. Produce the report

Output a single report in this exact structure. Nothing before it, nothing after it except the "Next" line.

```
## Engineer review: <current-branch> vs <base>
**Scope:** <N files changed, +X / -Y lines>

### Summary
<1-2 sentence plain-English description of what this branch does.>

### Findings

#### Blocker
1. **[Category]** `path/to/file.js:LINE` - <short title>
   <2-5 sentence detailed description. What is wrong, why it matters, what to do.>
   <LINE is the line number in the actual working-tree file (verified per step 2), NOT a diff line number.>

#### Major
...

#### Minor
...

#### Nit
...

### Next
Pick a finding number to discuss, say "walk me through them", or say "fix blockers" to start patching.

---
_Tip: rename this chat via the `⋮` menu to keep eng-reviews grouped in the sidebar:_
`[eng.review] <current-branch>`
```

Substitute `<current-branch>` with the actual branch name (the one resolved in step 1). Example: `[eng.review] Seth/counter-refactor`. Leave the backticks around the suggested name so the user can click-to-copy in the chat.

Severity meaning:
- **Blocker** - must fix before merge. Actual bug or security hole.
- **Major** - should fix. Likely bug or meaningful perf regression.
- **Minor** - worth considering. Clarity, consistency, robustness.
- **Nit** - optional polish. Naming, comments, small style.

If a severity bucket is empty, write "_none_" under it rather than omitting the heading.

### 5. Stop

After the report, **stop and wait**. Do not start proposing fixes. The user drives the discussion from here.

## Hard constraints

- **Never start the dev server** (`npm start`) or run `npm install` unless the user asks.
- **Do not run tests** unless the user asks; if asked, use `npm test -- --watchAll=false` so it does not hang in watch mode.
- **Do not modify any file** during the review itself. This command is read-only while findings are being produced and discussed.
- **Edit policy after the review depends on who owns the branch** (determined by the author segment of the current branch name -- the part before the first `/`):
  - **The user's own branch** -- the branch name begins with `Seth` (case-insensitive, i.e. `Seth/...`). Edits are allowed once the user picks findings to fix, following the normal flow.
  - **Someone else's branch** -- any other prefix (e.g. `Alex/...`). **Never modify any file**, even after the user picks a finding to discuss, **unless the user explicitly asks you to make the change.** Discussing, explaining, and proposing diffs in chat is fine; writing to files is not, absent an explicit request. When in doubt, propose the change in chat and ask before editing.
- Follow everything in root `CLAUDE.md`.
