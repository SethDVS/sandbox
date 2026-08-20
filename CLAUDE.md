# CLAUDE.md

Guidance for Claude Code when working in this repository, including the
`@claude` GitHub Actions bot.

## GitHub PR interactions

- When responding to an inline review comment (a `pull_request_review_comment`
  event), reply in the same thread rather than only in the tracking comment.
  Post the reply with:

  ```
  gh api repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies -f body="..."
  ```

  where `comment_id` is the id of the inline comment that mentioned you.

- When asked to review code, prefer inline comments on the specific lines
  (via the `mcp__github_inline_comment__create_inline_comment` tool) for
  individual findings, followed by a single summary comment.
