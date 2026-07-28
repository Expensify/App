## CodeCov

[CodeCov](https://about.codecov.io/) is the service we use to measure and track [code coverage](https://about.codecov.io/resource/what-is-code-coverage/). It comments on PRs with metrics that authors and reviewers can use to judge the relative safety of the code. It's one metric and shouldn't be used in isolation, but it can provide valuable insight into how risky a PR might be. 

The comment will provide you with a table of information similar to the one below:
| [Files with missing lines](https://app.codecov.io/gh/blimpich/App/pull/3?dropdown=coverage&src=pr&el=tree&utm_medium=referral&utm_source=github&utm_content=comment&utm_campaign=pr+comments&utm_term=Ben+Limpich) | Coverage Δ | |
|---|---|---|
| [src/libs/file_a.ts](https://app.codecov.io/gh/Expensify/App) | `50.58% <0.00%> (-1.20%)` | :arrow_down: | 
| [src/libs/file_b.ts](https://app.codecov.io/gh/Expensify/App) | `67.79% <ø> (ø)` | |
| [src/libs/file_c.ts](https://app.codecov.io/gh/Expensify/App) | `73.64% <ø> (+2.32%)` | :arrow_up: |
| [src/libs/file_d.ts](https://app.codecov.io/gh/Expensify/App) | `98.11% <100.00%> (+0.15%)` | :arrow_up: |

The first number in the `Coverage Δ` column is the coverage that the file currently has on `main`. The second number is the "patch-level coverage," so it represents the code coverage for PR changes itself. The third and final number is the overall change in code coverage % for that file. Lets run through these examples to get a better idea how this plays out:

- `file_a` seems to have no tests for it's changes, so patch coverage is 0% and we decrease overall coverage of the file by 1.2%
- `file_b` appears to have been altered, but not in a way that changed coverage, so the PR probably updated a comment or something that isn't part of our coverage calculation (ex: translation file changes)
- `file_c` has no change in patch coverage but an increase in overall coverage. This happens if we just add tests but don't add new code that needs to be tested
- `file_d` has 100% patch coverage so we added tests for all our changes there, but the file still has some untested lines, so we only increased the overall coverage by 0.15%

If a file has existing coverage, we should _always_ be trying to increase or maintain the existing level of coverage. That way, over time, our code coverage will increase, we will catch more bugs in the PR-stage, and fewer PRs will have to be reverted. Decreasing coverage for a file should be avoided! So the above example would need more tests to cover `file_a`'s changes in order to be merged. To get more granular information on what exact lines are and aren't covered in your PR and in the file as a whole you can click on the hyperlinked files or go to `https://app.codecov.io/gh/Expensify/App/pull/<your_PR_number>` to look at the full coverage report.

If you find an issue with the generated coverage report please reach out to an Expensify engineer in our [open-source Slack channel](https://expensify.enterprise.slack.com/archives/C01GTK53T8Q).