# Steps parsing rules

Detailed rules for extracting a flow list from a PR or issue body. Read this when the triage gate reaches the "Steps parsing" step.

The **only hard rule**: steps live in a Markdown body. Where they live within that body depends on the source kind, and what counts as "structure" inside the steps section varies wildly across authors.

## Section anchor (heuristic, with fallback)

Strip the body to the steps section using a list of known headings, in order:

| Source | Anchor (in priority order) |
| --- | --- |
| PR | `### Tests`, `### Test`, `## Tests` |
| Issue | `## Action Performed:`, `## Repro`, `## Steps to reproduce`, `## Reproduction Steps` |

If no anchor matches, pass the **whole body** to the LLM and ask it to find the steps. The anchor list is a hint, not a hard contract.

Stop the section at the next equal-or-higher heading (e.g. for issues, `## Expected Result:` ends the steps section). Strip trailing GitHub-template footers (Upwork automation block, contributing-guide preamble, `## Workaround:`, `## Screenshots/Videos`).

## Boilerplate stripping

- "Verify that no errors appear in the JS console" line - strip wherever it appears.
- Trailing `- [x] ...` checklist blocks - strip.
- Preamble metadata blocks (`**Version Number:** ...`, `**Device used:** ...`, etc.) - strip.

## Flow segmentation (LLM-driven)

Pass the stripped section to the LLM and ask it to return a list of flows: `[{title, precondition?, steps[]}, ...]`. Signals it may use (all optional - the LLM picks whichever apply):

- Explicit separators: `#### Test case N:` / `## ...` headers, `---` rules.
- Numbered-list restarts (a fresh `1.` after a `5.` typically signals a new flow).
- Prose markers: "Test case N:", "Repeat with...", "Then test...", "Now do...".
- State-change indicators: "Sign out, then ...", "On a fresh session, ...".

**Issues are typically single-flow.** Bug reports describe one repro path. The LLM should return one flow for an issue body unless it sees explicit multi-scenario structure (rare).

When the LLM finds a single coherent flow, the whole section is one flow. When it finds N, it produces N.

## Per flow

The LLM returns these fields:

- `title` - short label (header text if present, or LLM-summarized intent).
- `precondition` - free-form setup metadata if the author provided one (e.g. "Account has no workspace.", "Log in with Expensifail account.").
- `steps[]` - the numbered/listed items belonging to this flow, with nested `a/b/c` sub-items flattened into the parent.
- `expected` (issues only) - free-form expected outcome from the issue's `## Expected Result:` block. The driver MAY use this as a final-state assertion target after the flow drives.

## Single-step verify-only classification

If a flow has exactly one step whose intent is purely a `Verify|Confirm|Check` (no preceding action), set `kind: still`. Otherwise `kind: video`. LLM judgment, not regex.

## Step interpretation

Each step's text is passed verbatim to the agent-device driver, which decides per-step whether it's a tap, fill, navigation, or assertion. If the driver cannot interpret a step, that step (and the rest of the flow) hard-fails.

If the LLM returns an empty flow list (body was prose-only, "N/A", "We'll test it live", or empty after stripping), exit `3 NO_FLOWS`.
