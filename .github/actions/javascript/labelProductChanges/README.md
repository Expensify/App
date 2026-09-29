# Product-change labeling

This action adds `IncludesProductChange` to App PRs that change product behavior or UI. It also adds the label when classification is uncertain.
Only an explicit `clearly_non_product` result avoids labeling. Existing labels are preserved, and already-labeled PRs skip inference.

## Events and classification

The workflow processes non-draft PRs on opening, marking ready, new commits, reopening, and base-branch edits. It includes fork and bot PRs.
Each run reads the full PR through GitHub's paginated changed-files API. It compares file counts and patch totals with the PR metadata.
Missing patches, incomplete evidence, and inputs above 180,000 characters produce a conservative fallback. Binary changes therefore receive the label.

The model is `gpt-5.1`, using `OPENAI_APP_REVIEWER_API_KEY` and the existing Responses API helper. Classification has a 90-second deadline.
Model errors, missing credentials, and invalid responses also produce a fallback. Label-write errors fail the run.

The privileged workflow executes trusted workflow-revision code. It treats PR content as data and gives the model no tools.
Before publishing, it checks the current head SHA, base SHA, base branch, draft status, and existing label.

## Dry runs and backfill

After the workflow reaches the default branch, use **Actions → Label product changes → Run workflow**.
Enter a PR number. Keep `dry_run` enabled to evaluate without writing labels. Dry runs can evaluate closed and already-labeled PRs; drafts are skipped.

```sh
gh workflow run labelProductChanges.yml --repo Expensify/App \
    -f pull_request_number=PR_NUMBER -f dry_run=true
```

For backfill, list the open non-draft PRs and dispatch each selected PR with `dry_run=false`.
Each run rechecks eligibility. Repeating a run does not remove or duplicate labels.

```sh
gh api --paginate 'repos/Expensify/App/pulls?state=open&per_page=100' \
    --jq '.[] | select(.draft == false) | select(all(.labels[]; .name != "IncludesProductChange")) | .number'

gh workflow run labelProductChanges.yml --repo Expensify/App \
    -f pull_request_number=PR_NUMBER -f dry_run=false
```

The workflow summary and `RESULT` output include the revision, model, verdict, explanation, fallback reason, and label action.
Dry runs report `would_add_label` or `would_skip_label`. They cannot validate label-write permissions or GitHub event delivery.

## Local evaluation before merge

1. Install dependencies with the repository's Node, npm, and Bun versions.
2. Run `npm run gh-actions-build`.
3. Set `INPUT_OPENAI_API_KEY` in the environment from an authorized credential source.
4. Run the compiled action for each sample PR with dry-run mode enabled.

```sh
GITHUB_REPOSITORY=Expensify/App \
GITHUB_EVENT_NAME=workflow_dispatch \
GITHUB_TOKEN="$(gh auth token)" \
INPUT_PULL_REQUEST_NUMBER=PR_NUMBER \
INPUT_DRY_RUN=true \
GITHUB_STEP_SUMMARY="$(mktemp)" \
node .github/actions/javascript/labelProductChanges/index.js
```

Select 20–30 recent PRs. Include UI changes, behavior fixes, Onyx refactors, tests/tooling, mixed changes, and dependency updates.
Review the diffs and record expected classifications before running the model. Record each PR URL, revision, expected result, actual result, and explanation.
Review ambiguous cases with an engineer. Investigate missed product changes first; conservative extra labels are acceptable during the trial.
Record model failures separately from valid model verdicts. A run without an API key tests fallback behavior, not prompt accuracy.

## Automated validation

```sh
npm run test:bun -- -t 'product-change|full-PR evidence|OpenAIUtils'
npm run lint-changed
npm run typecheck
npm run spell-changed
```

Build the action bundles and stage the intended changes before running `.github/scripts/verifyActions.sh`.
Mocked tests cover eligibility, classification, fallback, revision changes, dispatch, and label writes. They spend no model tokens.

## Rollout and observation

1. Complete automated validation and the real-PR accuracy check.
2. Merge the labeling workflow.
3. Verify opening a non-draft PR, marking a draft ready, and pushing another commit. Confirm fork and bot event delivery.
4. Verify an existing label is preserved and a write-mode dispatch adds the label when appropriate.
5. Backfill existing open non-draft PRs.
6. Enable checklist grouping through its separate PR, then inspect the first generated checklist.

Automation that creates PRs with `GITHUB_TOKEN` can have different event-delivery rules. Verify each relevant producer rather than relying on its bot username.
A workflow that never starts cannot apply the conservative fallback. Inspect failed or missing runs during rollout and rerun eligible PRs through dispatch.

For 2–3 weeks, post a short weekly update in the tracking issue:

- Sample unlabeled PRs for missed product changes.
- Sample labeled refactors and tooling PRs for excessive labeling.
- Compare label results with current product-review assignments. Treat assignments as a comparison, not ground truth.
- Record workflow failures and fallback rates separately from model accuracy.
- Include examples and recommend prompt changes, continued observation, or the reviewer-assignment follow-up.

Current product-review assignment continues during the trial. The later Web-Expensify change must distinguish pending classification from confirmed non-product results.
