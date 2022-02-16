<!-- If necessary, assign reviewers that know the area or changes well. Feel free to tag any additional reviewers you see fit. -->

### Details
<!-- Explanation of the change or anything fishy that is going on -->

### Fixed Issues
<!---
Please replace GH_LINK with the link to the GitHub issue this Pull Request is fixing.
Do NOT add the special GH keywords like `fixed` etc, we have our own process of managing the flow.
It MUST be an entire link to the issue; otherwise, the linking will not work as expected.

Make sure this section looks similar to this (you can link multiple issues using the same formatting, just add a new line):

$ https://github.com/Expensify/App/issues/<number-of-the-issue>

Do NOT only link the issue number like this: $ #<number-of-the-issue>
--->
$ GH_LINK

### Tests
<!---
Add a numbered list of manual tests you performed that validates your changes work on all platforms, and that there are no regressions present.
Add any additional test steps if test steps are unique to a particular platform.
Manual test steps should be written so that your reviewer can repeat and verify one or more expected outcomes in the development environment.

For example:
1. Click on the text input to bring it into focus
2. Upload an image via copy paste
3. Verify a modal appears displaying a preview of that image
--->

- [ ] Verify that no errors appear in the JS console

### Contributor Plus (C+) PR Review Checklist ([full steps here](../PR_REVIEW_GUIDELINES.md))
<!--
This is a checklist for C+ reviewers. If the PR is internal, these do not need to be checked off, but are still a nice reminder for what to look for when reviewing PRs.
-->
- [ ] Are screenshots or videos included for tests on [all platforms](https://github.com/Expensify/App/blob/main/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)?
- [ ] Did you test this PR on **all platforms**?
- [ ] Is the correct issue linked in the `### Fixed Issues` section?
- [ ] Are testing steps clear and do they cover the changes + possible regressions?
- [ ] Do testing steps cover success & fail scenarios (if applicable)?
- [ ] Are there any console errors related to changes in this PR?
- [ ] Are new regression steps mentioned below? (if applicable, tag Expensify/QA team leads to add these to the regression test suite)
- [ ] Were code patterns checked? (see [Reviewing the code](../PR_REVIEW_GUIDELINES.md#reviewing-the-code))
- [ ] Does code reuse look appropriate? (see [Considerations around code reuse](../PR_REVIEW_GUIDELINES.md#considerations-around-code-reuse))

### QA Steps
<!---
Add a numbered list of manual tests that can be performed by our QA engineers on the staging environment to validate that your changes work on all platforms, and that there are no regressions present.
Add any additional QA steps if test steps are unique to a particular platform.
Manual test steps should be written so that the QA engineer can repeat and verify one or more expected outcomes in the staging environment.

For example:
1. Click on the text input to bring it into focus
2. Upload an image via copy paste
3. Verify a modal appears displaying a preview of that image
--->

- [ ] Verify that no errors appear in the JS console

### Tested On

- [ ] Web
- [ ] Mobile Web
- [ ] Desktop
- [ ] iOS
- [ ] Android

### Screenshots
<!-- Add screenshots for all platforms tested. Pull requests won't be merged unless the screenshots show the app was tested on all platforms.-->

#### Web
<!-- Insert screenshots of your changes on the web platform-->

#### Mobile Web
<!-- Insert screenshots of your changes on the web platform (from a mobile browser)-->

#### Desktop
<!-- Insert screenshots of your changes on the desktop platform-->

#### iOS
<!-- Insert screenshots of your changes on the iOS platform-->

#### Android
<!-- Insert screenshots of your changes on the Android platform-->
