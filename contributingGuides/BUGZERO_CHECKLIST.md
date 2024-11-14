# BugZero Checklist:

- [ ] **[Contributor]** Classify the bug:

<details>
<summary>Bug classification</summary>
<!-- Please keep the "1a." text in tact on all of the options below so that the results can be easily parsed by a script. Each of the "Other" options should be last on the list which is why they have a "z" in the selector (eg. "1z."). This allows the list to grow if someone desires to add more options down the road. -->

Source of bug:
  - [ ] 1a. Result of the original design (eg. a case wasn't considered)
  - [ ] 1b. Mistake during implementation
  - [ ] 1c. Backend bug
  - [ ] 1z. Other:

Where bug was reported:
  - [ ] 2a. Reported on production
  - [ ] 2b. Reported on staging (deploy blocker)
  - [ ] 2c. Reported on both staging and production
  - [ ] 2d. Reported on a PR
  - [ ] 2z. Other:

Who reported the bug:
  - [ ] 3a. Expensify user
  - [ ] 3b. Expensify employee
  - [ ] 3c. Contributor
  - [ ] 3d. QA
  - [ ] 3z. Other:

</details>

- [ ] **[Contributor]** The offending PR has been commented on, pointing out the bug it caused and why, so the author and reviewers can learn from the mistake.

    Link to comment:

- [ ] **[Contributor]** If the regression was CRITICAL (e.g. interrupts a core flow) A discussion in [#expensify-open-source](https://app.slack.com/client/E047TPA624F/C01GTK53T8Q) has been started about whether any other steps should be taken (e.g. updating the PR review checklist) in order to catch this type of bug sooner.

    Link to discussion:

- [ ] **[Contributor]** If it was decided to create a regression test for the bug, please propose the [regression test](https://github.com/Expensify/App/blob/main/contributingGuides/REGRESSION_TEST_BEST_PRACTICES.md) steps using the template below to ensure the same bug will not reach production again.

<details>
<summary>Regression Test Proposal Template</summary>
<!-- AFTER FILLING THIS OUT, be sure to remove the <details> and <summary> tags from this part of the checklist!!!!! -->

- [ ] **[BugZero Assignee]** Create a GH issue for creating/updating the regression test once above steps have been agreed upon.

    Link to issue:

## Regression Test Proposal
### Precondition:
<!-- List the setup instructions necessary to perform the test -->

-

### Test:
<!-- List the steps that QA should perform -->

1.

Do we agree 👍 or 👎

<!-- AFTER FILLING THIS OUT, be sure to remove the <details> tags!!!!! -->
</details>
