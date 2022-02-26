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

### PR Review Checklist
<!--
This is a checklist for PR authors & reviewers. Please make sure to complete all tasks and check them off once you do, or else Expensify has the right not to merge your PR!
-->
#### Contributor (PR Author) Checklist
- [ ] I made sure to pull `main` before submitting my PR for review
- [ ] I linked the correct issue in the `### Fixed Issues` section above
- [ ] I wrote clear testing steps that cover the changes made in this PR
    - [ ] I clearly indicated the environment tests should be run in (Staging vs Production)
- [ ] I wrote testing steps that cover success & fail scenarios (if applicable)
- [ ] I ran the tests & they passed on **all platforms**
- [ ] I included screenshots or videos for tests on [all platforms](https://github.com/Expensify/App/blob/main/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [ ] I verified there are no console errors related to changes in this PR
- [ ] I followed proper code patterns (see [Reviewing the code](https://github.com/Expensify/App/blob/main/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
    - [ ] I added comments when the code was not self explanatory
    - [ ] I put all copy / text shown in the product in all `src/languages/*` files (if applicable)
    - [ ] I followed proper naming convention for platform-specific files (if applicable)
    - [ ] I followed style guidelines (in [`Styling.md`](https://github.com/Expensify/App/blob/main/STYLING.md)) for all style edits I made
- [ ] I followed the guidelines as stated in the [Review Guidelines](https://github.com/Expensify/App/blob/main/PR_REVIEW_GUIDELINES.md)

#### PR Reviewer Checklist
- [ ] I verified the Author pulled `main` before submitting the PR
- [ ] I verified the correct issue is linked in the `### Fixed Issues` section above
- [ ] I verified testing steps are clear and they cover the changes made in this PR
    - [ ] I verified the testing environment is mentioned in the test steps
- [ ] I verified testing steps cover success & fail scenarios (if applicable)
- [ ] I verified tests pass on **all platforms** & I tested again on all platforms
- [ ] I checked that screenshots or videos are included for tests on [all platforms](https://github.com/Expensify/App/blob/main/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [ ] I verified there are no console errors related to changes in this PR
- [ ] I verified proper code patterns were followed (see [Reviewing the code](https://github.com/Expensify/App/blob/main/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
    - [ ] I verified comments were added when the code was not self explanatory
    - [ ] I verified any copy / text shown in the product was added in all `src/languages/*` files (if applicable)
    - [ ] I verified proper naming convention for platform-specific files was followed (if applicable)
    - [ ] I verified [style guidelines](https://github.com/Expensify/App/blob/main/STYLING.md) were followed
- [ ] I verified that this PR follows the guidelines as stated in the [Review Guidelines](https://github.com/Expensify/App/blob/main/PR_REVIEW_GUIDELINES.md)

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
