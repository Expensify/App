# ProposalPolice™

ProposalPolice™ is a GitHub Action that watches comments on `Help Wanted` issues. It keeps proposal threads readable by reminding people to use the proposal template, collapsing comments that ask for a job without proposing anything, and withdrawing proposals that duplicate an existing one.

It only ever comments, collapses, or edits comments. It never assigns a job, and it never decides whether a proposal is any good — that is still the C+ and internal engineer's call. See [CONTRIBUTING.md](./CONTRIBUTING.md#propose-a-solution-for-the-job) for the proposal process itself.

## When it runs

It runs when a comment is created or edited, and does nothing unless all of these are true:

- The issue is open and has the `Help Wanted` label.
- The comment is not from an internal bot.
- The comment author is not assigned to the issue.
- For an edit, the comment body actually changed.

## What it checks

A comment counts as a proposal when it contains the word "Proposal" plus both mandatory headings from the [proposal template](./PROPOSAL_TEMPLATE.md).

| Comment | What happens |
|---------|--------------|
| **Follows the template** | Compared against every earlier proposal on the issue. A close match is withdrawn (see below). |
| **Does not follow the template, but makes a real technical attempt** | You get a reply pointing you at the template. Your comment is left alone. |
| **Asks for the job with no technical content** — "assign me", "I applied on Upwork" | The comment is collapsed as spam and you get a reply asking for a proposal. |
| **Anything else** — questions, retest results, feedback on someone else's proposal, takeover coordination | Nothing. Ordinary discussion is not touched. |

Members of `expensify-expensify`, `contributor-plus`, or `contributor-plus-backend`, and anyone who says they are from agencies Expensify works with, can offer their services on a job without posting a proposal and won't be flagged as spam.

## Duplicate proposals

Every proposal on an issue is recorded, and each new one is scored against the earlier ones. Only the root cause and the proposed solution count — two proposals are similar when they propose the same technical change, no matter how differently they are written. Sharing a file name, a variable, or an error message is not enough.

If a new proposal scores 90% or higher against someone else's earlier proposal, ProposalPolice replaces the comment body with a withdrawal notice and posts a reply linking to the original. **Your text is gone at that point**, so read the existing proposals before posting.

Your own earlier proposals are never treated as duplicates, so you can freely revise your thinking in a new comment.

You may also see a short bot comment saying it is tracking duplicate proposals for the issue. That comment stores an ID it needs between runs and can be ignored.

## Edited proposals

When you substantially change the root cause or the solution in a proposal, ProposalPolice prepends a banner with the time of the edit, so reviewers can see the proposal they read has changed. Fixing a typo or rewording a sentence does not trigger it.

## If it gets something wrong

The action is deliberately fail-safe: any error is swallowed and the run is marked successful, so a bad run leaves your comment untouched rather than notifying everyone on the issue.

If it flags something incorrectly, say so on the issue and tag the C+ or the assigned engineer. Do not re-post the same proposal — it will be withdrawn again.

## Where the code lives

| Path | What it holds |
|------|---------------|
| [`.github/workflows/proposalPolice.yml`](../.github/workflows/proposalPolice.yml) | Trigger conditions and the trusted-commenter check |
| [`.github/actions/javascript/proposalPoliceComment`](../.github/actions/javascript/proposalPoliceComment) | All of the logic and the decision to act |
| [`prompts/proposalPolice`](../prompts/proposalPolice) | Instructions, response schemas, and every message it posts |
| [`scripts/utils/ProposalPolice`](../scripts/utils/ProposalPolice) | Bookkeeping for the recorded proposals used by duplicate detection |
| [`tests/tooling`](../tests/tooling) | Unit tests, which run in CI |
| [`evals/proposalPolice`](../evals/proposalPolice) | Offline evals for the three judgment calls. These cost real tokens and do **not** run in CI — run them by hand when changing a prompt, model, or threshold. See [evals/README.md](../evals/README.md). |

The wording of every message contributors see lives in `prompts/proposalPolice/messages.ts`. The model picks which message applies; it never writes one.

## Related documentation

- [PROPOSAL_TEMPLATE.md](./PROPOSAL_TEMPLATE.md) — the template ProposalPolice enforces
- [CONTRIBUTING.md](./CONTRIBUTING.md) — full contributor workflow
- [HOW_TO_WORK_WITH_MELVINBOT.md](./HOW_TO_WORK_WITH_MELVINBOT.md) — the AI agent that posts and implements proposals
- [AI_ETIQUETTE.md](./AI_ETIQUETTE.md) — accountability for AI-assisted work
