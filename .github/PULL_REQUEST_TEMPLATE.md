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
- [ ] I linked the correct issue in the `### Fixed Issues` section above
- [ ] I wrote clear testing steps that cover the changes made in this PR
    - [ ] I added steps for local testing in the `Tests` section
    - [ ] I added steps for Staging and/or Production testing in the `QA steps` section
    - [ ] I added steps to cover failure scenarios (i.e. verify an input displays the correct error message if the entered data is not correct)
    - [ ] I turned off my network connection and tested it while offline to ensure it matches the expected behavior (i.e. verify the default avatar icon is displayed if app is offline)
- [ ] I included screenshots or videos for tests on [all platforms](https://github.com/Expensify/App/blob/main/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [ ] I ran the tests on **all platforms** & verified they passed on:
    - [ ] iOS / native
    - [ ] Android / native
    - [ ] iOS / Safari
    - [ ] Android / Chrome
    - [ ] MacOS / Chrome
    - [ ] MacOS / Desktop
- [ ] I verified there are no console errors (if there’s a console error not related to the PR, report it or open an issue for it to be fixed)
- [ ] I followed proper code patterns (see [Reviewing the code](https://github.com/Expensify/App/blob/main/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
    - [ ] I verified that any callback methods that were added or modified are named for what the method does and never what callback they handle (i.e. “toggleReport” and not “onIconClick”)
    - [ ] I verified that comments were added to code that is not self explanatory
    - [ ] I verified that any new or modified comments were clear, correct english, and explained “why” the code was doing something instead of only explaining “what” the code was doing.
    - [ ] I verified any copy / text shown in the product was added in all `src/languages/*` files
    - [ ] I verified any copy / text that was added to the app is correct english and approved by marketing by tagging the marketing team on the original GH to get the correct copy.
    - [ ] I verified proper file naming conventions were followed for any new files or renamed files. All non-platform specific files are named after what they export and are not named “index.js”. All platform-specific files are named for the platform the code supports as outlined in the README.
    - [ ] I verified the JSDocs style guidelines (in [`STYLE.md`](https://github.com/Expensify/App/blob/main/STYLE.md#jsdocs)) were followed
- [ ] If a new code pattern is added I verified it was agreed to be used by multiple Expensify engineers
- [ ] I followed the guidelines as stated in the [Review Guidelines](https://github.com/Expensify/App/blob/main/PR_REVIEW_GUIDELINES.md)
- [ ] I tested other components that can be impacted by my changes (i.e. if the PR modifies a shared library or component like `Avatar`, I verified the components using `Avatar` are working as expected)
- [ ] I verified all code is DRY
- [ ] I verified any variables that can be defined as constants (ie. in CONST.js) are defined as such
- [ ] If a new component is created I verified that:
    - [ ] A similar component doesn't exist in the codebase
    - [ ] All props are defined accurately and each prop has a `/** comment above it */`
    - [ ] Any functional components have the `displayName` property
    - [ ] The file is named correctly
    - [ ] The component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone
    - [ ] The only data being stored in the state is data necessary for rendering and nothing else
    - [ ] Any internal methods are bound to “this” properly so there are no scoping issues
    - [ ] Any internal methods bound to “this” are necessary to be bound
    - [ ] All JSX used for rendering exists in the render method
    - [ ] The component has the minimum amount of code necessary for its purpose and it is
- [ ] If a new CSS style is added I verified that:
    - [ ] A similar style doesn’t already exist
    - [ ] The style can’t be created with an existing [StyleUtils](https://github.com/Expensify/App/blob/main/src/styles/StyleUtils.js) function
(i.e. `StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG`)



#### PR Reviewer Checklist
- [ ] I verified the correct issue is linked in the `### Fixed Issues` section above
- [ ] I verified testing steps are clear and they cover the changes made in this PR
    - [ ] I verified the steps for local testing are in the `Tests` section
    - [ ] I verified the steps for Staging and/or Production testing are in the `QA steps` section
    - [ ] I verified the steps cover any possible failure scenarios (i.e. verify an input displays the correct error message if the entered data is not correct)
    - [ ] I turned off my network connection and tested it while offline to ensure it matches the expected behavior (i.e. verify the default avatar icon is displayed if app is offline)
- [ ] I checked that screenshots or videos are included for tests on [all platforms](https://github.com/Expensify/App/blob/main/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [ ] I verified tests pass on **all platforms** & I tested again on:
    - [ ] iOS / native
    - [ ] Android / native
    - [ ] iOS / Safari
    - [ ] Android / Chrome
    - [ ] MacOS / Chrome
    - [ ] MacOS / Desktop
- [ ] I verified there are no console errors (if there’s a console error not related to the PR, report it or open an issue for it to be fixed)
- [ ] I verified proper code patterns were followed (see [Reviewing the code](https://github.com/Expensify/App/blob/main/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
    - [ ] I verified that any callback methods that were added or modified are named for what the method does and never what callback they handle (i.e. “toggleReport” and not “onIconClick”).
    - [ ] I verified that comments were added to code that is not self explanatory
    - [ ] I verified that any new or modified comments were clear, correct english, and explained “why” the code was doing something instead of only explaining “what” the code was doing.
    - [ ] I verified any copy / text shown in the product was added in all `src/languages/*` files
    - [ ] I verified any copy / text that was added to the app is correct english and approved by marketing by tagging the marketing team on the original GH to get the correct copy.
    - [ ] I verified proper file naming conventions were followed for any new files or renamed files. All non-platform specific files are named after what they export and are not named “index.js”. All platform-specific files are named for the platform the code supports as outlined in the README.
    - [ ] I verified the JSDocs style guidelines (in [`STYLE.md`](https://github.com/Expensify/App/blob/main/STYLE.md#jsdocs)) were followed
- [ ] If a new code pattern is added I verified it was agreed to be used by multiple Expensify engineers
- [ ] I verified that this PR follows the guidelines as stated in the [Review Guidelines](https://github.com/Expensify/App/blob/main/PR_REVIEW_GUIDELINES.md)
- [ ] I verified other components are not impacted by changes in this PR (i.e. if the PR modifies a shared library or component like `Avatar`, I verified the components using `Avatar` are working as expected)
- [ ] I verified all code is DRY
- [ ] I verified any variables that can be defined as constants (ie. in CONST.js) are defined as such
- [ ] If a new component is created I verified that:
    - [ ] A similar component doesn't exist in the codebase
    - [ ] All props are defined accurately and each prop has a `/** comment above it */`
    - [ ] Any functional components have the `displayName` property
    - [ ] The file is named correctly
    - [ ] The component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone
    - [ ] The only data being stored in the state is data necessary for rendering and nothing else
    - [ ] Any internal methods are bound to “this” properly so there are no scoping issues
    - [ ] Any internal methods bound to “this” are necessary to be bound
    - [ ] All JSX used for rendering exists in the render method
    - [ ] The component has the minimum amount of code necessary for its purpose and it is broken down into smaller components in order to separate concerns and functions
- [ ] If a new CSS style is added I verified that:
    - [ ] A similar style doesn’t already exist
    - [ ] The style can’t be created with an existing [StyleUtils](https://github.com/Expensify/App/blob/main/src/styles/StyleUtils.js) function
(i.e. `StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG`)

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
