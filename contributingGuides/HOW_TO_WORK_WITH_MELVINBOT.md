# Working with MelvinBot on App Issues

MelvinBot (Melvin) is Expensify's AI agent for App GitHub issues. On many open-source jobs, Melvin posts the first proposal automatically. This guide explains how contributors, Contributor+ (C+), and internal engineers work together on those issues.

For general contributor workflow (proposals, payment, PR standards), see [CONTRIBUTING.md](./CONTRIBUTING.md). For C+ responsibilities, see [HOW_TO_BECOME_A_CONTRIBUTOR_PLUS.md](./HOW_TO_BECOME_A_CONTRIBUTOR_PLUS.md).

## Why this process exists

Melvin can open pull requests before a human has validated the approach. Without a clear process, contributors waste time on unapproved work, and internal engineers may review PRs that should not have been started. Proposal review must happen **before** implementation.

## Roles

| Role | Responsibility on Melvin issues |
|------|----------------------------------|
| **MelvinBot** | Posts the first proposal on the issue. Implements the accepted solution when asked. Opens a draft PR with MelvinBot as the GitHub author. |
| **Contributor** | May submit their own proposal if they have a meaningfully different approach. Must not open a PR until a proposal is accepted and they are hired on the job. |
| **Contributor+ (C+)** | Reviews proposals (Melvin's and any contributor proposals) using the same standards as any other job. If Melvin's proposal is accepted, asks Melvin to implement, then owns the PR as the human author before sending it for final review. |
| **Contributor Manager Engineer (CME)** | Internal engineer assigned to review and merge the PR. |

Only Expensify employees, C+ members, and backend contributors can trigger Melvin with `@MelvinBot` comments on GitHub.

## Workflow overview

```
Issue opened → Melvin posts proposal → C+ reviews proposal(s)
    → Accepted: C+ asks Melvin to implement
    → Not accepted: C+ explains why
→ Melvin opens draft PR → C+ tweaks, tests, posts PR body/checklist in a PR comment, asks Melvin to apply it, self-reviews (including Reviewer checklist)
→ C+ submits PR for review as human author → CME reviews and merges (PR body and/or C+ PR comment)
```

## Phase 1: Proposal review

Melvin's proposal will always be the first on the issue. Follow the **same proposal review process** as any other App job:

1. Use the [proposal template](./PROPOSAL_TEMPLATE.md) criteria: clear root cause, concrete solution, no code diffs.
2. C+ reviews Melvin's proposal with the same rigor as a contributor proposal. Do not approve proposals that lack a satisfying root-cause explanation.
3. Contributors may still post proposals if they have a **meaningfully different** approach (see [CONTRIBUTING.md](./CONTRIBUTING.md#propose-a-solution-for-the-job)).
4. **No one opens a pull request** until a proposal is accepted.

### If Melvin's proposal is accepted

The assigned C+ comments on the issue asking Melvin to implement, for example:

```
@MelvinBot please implement your proposal
```

Adjust the wording if needed, but the comment must mention `@MelvinBot` and clearly request implementation.

### If Melvin's proposal is not accepted

The C+ explains **why** the proposal was not accepted (wrong root cause, incomplete solution, better alternative exists, etc.). If a contributor's proposal is accepted instead, follow the standard contributor hiring and implementation flow in [CONTRIBUTING.md](./CONTRIBUTING.md).

When a C+ accepts a proposal, they may also post `🎀👀🎀` on the issue to trigger CME assignment for the job.

## Phase 2: C+ owns the pull request

Melvin opens a draft PR linked to the issue. MelvinBot remains the GitHub author on GitHub until the C+ takes ownership of the work. Because MelvinBot is the PR author, most C+ members **cannot edit the PR description directly** (GitHub only allows the author or users with write access to edit a pull request body).

Before requesting final review, the assigned C+ must:

1. **Manually tweak the PR** if Melvin's implementation needs corrections.
2. **Test the change** on all required platforms (see [CONTRIBUTING.md](./CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)).
3. **Complete every step** in the PR Author Checklist (see [Updating the PR description and checklist](#updating-the-pr-description-and-checklist) below).
4. **Self-review the code** against [PR Review Guidelines](./PR_REVIEW_GUIDELINES.md), [PR Authoring & Reviewing Best Practices](./PR_AUTHOR_REVIEWER_BEST_PRACTICES.md), and complete the [Reviewer Checklist](./REVIEWER_CHECKLIST.md) as part of that self-review.
5. **Submit the PR for review** and become the **official human author** of record for that change.

The C+ is accountable for the PR quality, the same as any contributor who authored a PR.

### Updating the PR description and checklist

C+ members who cannot edit the PR body directly should use this workaround:

1. On the **pull request**, post a comment with the exact content you want in the PR description. Put the full body inside a `<details>` block so the PR thread stays readable. Include the complete [PR template](https://github.com/Expensify/App/blob/main/.github/PULL_REQUEST_TEMPLATE.md) when possible: Explanation of Change, Fixed Issues, Tests, Offline tests, QA Steps, a fully checked PR Author Checklist, and Screenshots/Videos sections as needed.
2. In the same comment, ask Melvin to copy that content into the pull request body, for example:

```
@MelvinBot please set the PR body to the content in the details section above
```

To update only the checklist, post the checklist section in a `<details>` block and ask Melvin to set just that portion of the PR body.

Example:

```markdown
<details>
<summary>PR body for MelvinBot to apply</summary>

### Explanation of Change
...

### Fixed Issues
$ https://github.com/Expensify/App/issues/12345

### Tests
1. ...

### PR Author Checklist
- [x] I linked the correct issue in the `### Fixed Issues` section above
...

</details>

@MelvinBot please set the PR body to the content in the details section above
```

3. Confirm Melvin updated the PR description before marking the pull request ready for review.

The C+ PR comment is the **source of truth** for what was tested and checked. CMEs may review that comment directly when the PR body is incomplete, out of date, or hard to verify.

## Phase 3: CME review and merge

After the C+ submits the PR for review:

1. A **CME** (internal engineer) is assigned to review and merge.
2. The CME follows the normal internal review process. Review the **PR body** when Melvin has applied the C+ content, or review the C+ **PR comment** (with the `<details>` block) directly for testing steps and checklist completion.
3. Payment and regression checklists follow the standard rules in [CONTRIBUTING.md](./CONTRIBUTING.md).

### No additional contributor or C+ PR review

We intentionally do **not** add a second round of contributor or C+ PR review on top of the CME review. Prior discussions did not surface a problem that extra review would solve, and an additional review step would add cost and delay without clear benefit. The C+ self-review before submission, combined with CME review, is the intended quality gate.

## Quick reference: what not to do

| Do not | Why |
|--------|-----|
| Open a PR before a proposal is accepted | Wastes contributor and reviewer time if the approach is wrong |
| Skip C+ proposal review because Melvin wrote it | Melvin proposals need the same validation as human proposals |
| Send Melvin's draft PR for CME review without testing and checklist completion | The C+ is the human author and owns quality |
| Assume you can edit Melvin's PR description in the GitHub UI | Post the body in a PR comment and ask `@MelvinBot` to apply it |
| Expect a second C+ or contributor review after C+ submission | Only the CME reviews before merge |

## Related documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) — full contributor workflow
- [PROPOSAL_TEMPLATE.md](./PROPOSAL_TEMPLATE.md) — proposal format and C+ review instructions
- [Reviewer Checklist](./REVIEWER_CHECKLIST.md) — C+ completes this during self-review before submitting for CME review
- [AI Etiquette](./AI_ETIQUETTE.md) — accountability for AI-assisted work
- [AI Reviewer philosophy](./philosophies/AI-REVIEWER.md) — automated PR feedback vs human review
