<!-- If necessary, assign reviewers that know the area or changes well. Feel free to tag any additional reviewers you see fit. -->

### Details
<!-- Explanation of the change or anything fishy that is going on -->

### Fixed Issues
<!---
1. Please postfix `$` with a URL link to the GitHub issue this Pull Request is fixing. For example, `$ https://github.com/Expensify/App/issues/<issueID>`.
2. Please postfix  `PROPOSAL:` with a URL link to your GitHub comment, which contains the approved proposal (i.e. the proposal that was approved by Expensify).  For example, `PROPOSAL: https://github.com/Expensify/App/issues/<issueID>#issuecomment-1369752925`

Do NOT add the special GH keywords like `fixed` etc, we have our own process of managing the flow.
It MUST be an entire link to the github issue and your comment proposal ; otherwise, the linking and its automation will not work as expected.

Make sure this section looks similar to this (you can link multiple issues using the same formatting, just add a new line):

$ https://github.com/Expensify/App/issues/<issueID>
$ https://github.com/Expensify/App/issues/<issueID(comment)>

Do NOT only link the issue number like this: $ #<issueID>
--->
$ 
PROPOSAL: 


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

### Offline tests
<!---
Add any relevant steps that validate your changes work as expected in a variety of network states e.g. "offline", "spotty connection", "slow internet", etc. Manual test steps should be written so that your reviewer and QA testers can repeat and verify one or more expected outcomes. If you are unsure how the behavior should work ask for advice in the `#expensify-open-source` Slack channel.
--->

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

### PR Author Checklist
<!--
This is a checklist for PR authors. Please make sure to complete all tasks and check them off once you do, or else your PR will not be merged!
-->

- [ ] I linked the correct issue in the `### Fixed Issues` section above
- [ ] I wrote clear testing steps that cover the changes made in this PR
    - [ ] I added steps for local testing in the `Tests` section
    - [ ] I added steps for the expected offline behavior in the `Offline steps` section
    - [ ] I added steps for Staging and/or Production testing in the `QA steps` section
    - [ ] I added steps to cover failure scenarios (i.e. verify an input displays the correct error message if the entered data is not correct)
    - [ ] I turned off my network connection and tested it while offline to ensure it matches the expected behavior (i.e. verify the default avatar icon is displayed if app is offline)
    - [ ] I tested this PR with a [High Traffic account](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#high-traffic-accounts) against the staging or production API to ensure there are no regressions (e.g. long loading states that impact usability).
- [ ] I included screenshots or videos for tests on [all platforms](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [ ] I ran the tests on **all platforms** & verified they passed on:
    - [ ] Android / native
    - [ ] Android / Chrome
    - [ ] iOS / native
    - [ ] iOS / Safari
    - [ ] MacOS / Chrome / Safari
    - [ ] MacOS / Desktop
- [ ] I verified there are no console errors (if there's a console error not related to the PR, report it or open an issue for it to be fixed)
- [ ] I followed proper code patterns (see [Reviewing the code](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
    - [ ] I verified that any callback methods that were added or modified are named for what the method does and never what callback they handle (i.e. `toggleReport` and not `onIconClick`)
    - [ ] I verified that the left part of a conditional rendering a React component is a boolean and NOT a string, e.g. `myBool && <MyComponent />`.
    - [ ] I verified that comments were added to code that is not self explanatory
    - [ ] I verified that any new or modified comments were clear, correct English, and explained "why" the code was doing something instead of only explaining "what" the code was doing.
    - [ ] I verified any copy / text shown in the product is localized by adding it to `src/languages/*` files and using the [translation method](https://github.com/Expensify/App/blob/4bd99402cebdf4d7394e0d1f260879ea238197eb/src/components/withLocalize.js#L60)
      - [ ] If any non-english text was added/modified, I verified the translation was requested/reviewed in #expensify-open-source and it was approved by an internal Expensify engineer. Link to Slack message:
    - [ ] I verified all numbers, amounts, dates and phone numbers shown in the product are using the [localization methods](https://github.com/Expensify/App/blob/4bd99402cebdf4d7394e0d1f260879ea238197eb/src/components/withLocalize.js#L60-L68)
    - [ ] I verified any copy / text that was added to the app is grammatically correct in English. It adheres to proper capitalization guidelines (note: only the first word of header/labels should be capitalized), and is approved by marketing by adding the `Waiting for Copy` label for a copy review on the original GH to get the correct copy.
    - [ ] I verified proper file naming conventions were followed for any new files or renamed files. All non-platform specific files are named after what they export and are not named "index.js". All platform-specific files are named for the platform the code supports as outlined in the README.
    - [ ] I verified the JSDocs style guidelines (in [`STYLE.md`](https://github.com/Expensify/App/blob/main/contributingGuides/STYLE.md#jsdocs)) were followed
- [ ] If a new code pattern is added I verified it was agreed to be used by multiple Expensify engineers
- [ ] I followed the guidelines as stated in the [Review Guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md)
- [ ] I tested other components that can be impacted by my changes (i.e. if the PR modifies a shared library or component like `Avatar`, I verified the components using `Avatar` are working as expected)
- [ ] I verified all code is DRY (the PR doesn't include any logic written more than once, with the exception of tests)
- [ ] I verified any variables that can be defined as constants (ie. in CONST.js or at the top of the file that uses the constant) are defined as such
- [ ] I verified that if a function's arguments changed that all usages have also been updated correctly
- [ ] If a new component is created I verified that:
    - [ ] A similar component doesn't exist in the codebase
    - [ ] All props are defined accurately and each prop has a `/** comment above it */`
    - [ ] The file is named correctly
    - [ ] The component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone
    - [ ] The only data being stored in the state is data necessary for rendering and nothing else
    - [ ] If we are not using the full Onyx data that we loaded, I've added the proper selector in order to ensure the component only re-renders when the data it is using changes
    - [ ] For Class Components, any internal methods passed to components event handlers are bound to `this` properly so there are no scoping issues (i.e. for `onClick={this.submit}` the method `this.submit` should be bound to `this` in the constructor)
    - [ ] Any internal methods bound to `this` are necessary to be bound (i.e. avoid `this.submit = this.submit.bind(this);` if `this.submit` is never passed to a component event handler like `onClick`)
    - [ ] All JSX used for rendering exists in the render method
    - [ ] The component has the minimum amount of code necessary for its purpose, and it is broken down into smaller components in order to separate concerns and functions
- [ ] If any new file was added I verified that:
    - [ ] The file has a description of what it does and/or why is needed at the top of the file if the code is not self explanatory
- [ ] If a new CSS style is added I verified that:
    - [ ] A similar style doesn't already exist
    - [ ] The style can't be created with an existing [StyleUtils](https://github.com/Expensify/App/blob/main/src/styles/StyleUtils.js) function (i.e. `StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG)`)
- [ ] If the PR modifies code that runs when editing or sending messages, I tested and verified there is no unexpected behavior for all supported markdown - URLs, single line code, code blocks, quotes, headings, bold, strikethrough, and italic.
- [ ] If the PR modifies a generic component, I tested and verified that those changes do not break usages of that component in the rest of the App (i.e. if a shared library or component like `Avatar` is modified, I verified that `Avatar` is working as expected in all cases)
- [ ] If the PR modifies a component related to any of the existing Storybook stories, I tested and verified all stories for that component are still working as expected.
- [ ] If the PR modifies a component or page that can be accessed by a direct deeplink, I verified that the code functions as expected when the deeplink is used - from a logged in and logged out account.
- [ ] If a new page is added, I verified it's using the `ScrollView` component to make it scrollable when more elements are added to the page.
- [ ] If the `main` branch was merged into this PR after a review, I tested again and verified the outcome was still expected according to the `Test` steps.
- [ ] I have checked off every checkbox in the PR author checklist, including those that don't apply to this PR.

### Screenshots/Videos
<details>
<summary>Web</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>Mobile Web - Chrome</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>Mobile Web - Safari</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>Desktop</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>iOS</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>Android</summary>

<!-- add screenshots or videos here -->

</details>
