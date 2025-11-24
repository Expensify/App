<!-- If necessary, assign reviewers that know the area or changes well. Feel free to tag any additional reviewers you see fit. -->

### Explanation of Change
<!-- Explain what your change does and how it addresses the linked issue -->

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


<!--- 
If you want to trigger adhoc build of hybrid app from specific Mobile-Expensify PR please link it like this:

MOBILE-EXPENSIFY: https://github.com/Expensify/Mobile-Expensify/pull/<PR-number>

--->

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

It's acceptable to write "Same as tests" if the QA team is able to run the tests in the above "Tests" section.
--->
// TODO: These must be filled out, or the issue title must include "[No QA]."

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
    - [ ] Android: Native
    - [ ] Android: mWeb Chrome
    - [ ] iOS: Native
    - [ ] iOS: mWeb Safari
    - [ ] MacOS: Chrome / Safari
- [ ] I verified there are no console errors (if there's a console error not related to the PR, report it or open an issue for it to be fixed)
- [ ] I verified there are no new alerts related to the `canBeMissing` param for `useOnyx`
- [ ] I followed proper code patterns (see [Reviewing the code](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
    - [ ] I verified that any callback methods that were added or modified are named for what the method does and never what callback they handle (i.e. `toggleReport` and not `onIconClick`)
    - [ ] I verified that comments were added to code that is not self explanatory
    - [ ] I verified that any new or modified comments were clear, correct English, and explained "why" the code was doing something instead of only explaining "what" the code was doing.
    - [ ] I verified any copy / text shown in the product is localized by adding it to `src/languages/*` files and using the [translation method](https://github.com/Expensify/App/blob/4510fc76bbf5df699a2575bfb49a276af90f3ed7/src/components/LocaleContextProvider.tsx#L80)
      - [ ] If any non-english text was added/modified, I used [JaimeGPT](https://chatgpt.com/g/g-2dgOQl5VM-english-to-spanish-translator-aka-jaimegpt) to get English > Spanish translation. I then posted it in #expensify-open-source and it was approved by an internal Expensify engineer. Link to Slack message:
    - [ ] I verified all numbers, amounts, dates and phone numbers shown in the product are using the [localization methods](https://github.com/Expensify/App/blob/4510fc76bbf5df699a2575bfb49a276af90f3ed7/src/components/LocaleContextProvider.tsx#L116-L123)
    - [ ] I verified any copy / text that was added to the app is grammatically correct in English. It adheres to proper capitalization guidelines (note: only the first word of header/labels should be capitalized), and is either coming verbatim from figma or has been approved by marketing (in order to get marketing approval, ask the Bug Zero team member to add the Waiting for copy label to the issue)
    - [ ] I verified proper file naming conventions were followed for any new files or renamed files. All non-platform specific files are named after what they export and are not named "index.js". All platform-specific files are named for the platform the code supports as outlined in the README.
    - [ ] I verified the JSDocs style guidelines (in [`STYLE.md`](https://github.com/Expensify/App/blob/main/contributingGuides/STYLE.md#jsdocs)) were followed
- [ ] If a new code pattern is added I verified it was agreed to be used by multiple Expensify engineers
- [ ] I followed the guidelines as stated in the [Review Guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md)
- [ ] I tested other components that can be impacted by my changes (i.e. if the PR modifies a shared library or component like `Avatar`, I verified the components using `Avatar` are working as expected)
- [ ] I verified all code is DRY (the PR doesn't include any logic written more than once, with the exception of tests)
- [ ] I verified any variables that can be defined as constants (ie. in CONST.ts or at the top of the file that uses the constant) are defined as such
- [ ] I verified that if a function's arguments changed that all usages have also been updated correctly
- [ ] If any new file was added I verified that:
    - [ ] The file has a description of what it does and/or why is needed at the top of the file if the code is not self explanatory
- [ ] If a new CSS style is added I verified that:
    - [ ] A similar style doesn't already exist
    - [ ] The style can't be created with an existing [StyleUtils](https://github.com/Expensify/App/blob/main/src/styles/utils/index.ts) function (i.e. `StyleUtils.getBackgroundAndBorderStyle(theme.componentBG)`)
- [ ] If new assets were added or existing ones were modified, I verified that:
    - [ ] The assets are optimized and compressed (for SVG files, run `npm run compress-svg`)
    - [ ] The assets load correctly across all supported platforms.
- [ ] If the PR modifies code that runs when editing or sending messages, I tested and verified there is no unexpected behavior for all supported markdown - URLs, single line code, code blocks, quotes, headings, bold, strikethrough, and italic.
- [ ] If the PR modifies a generic component, I tested and verified that those changes do not break usages of that component in the rest of the App (i.e. if a shared library or component like `Avatar` is modified, I verified that `Avatar` is working as expected in all cases)
- [ ] If the PR modifies a component related to any of the existing Storybook stories, I tested and verified all stories for that component are still working as expected.
- [ ] If the PR modifies a component or page that can be accessed by a direct deeplink, I verified that the code functions as expected when the deeplink is used - from a logged in and logged out account.
- [ ] If the PR modifies the UI (e.g. new buttons, new UI components, changing the padding/spacing/sizing, moving components, etc) or modifies the form input styles:
    - [ ] I verified that all the inputs inside a form are aligned with each other.
    - [ ] I added `Design` label and/or tagged `@Expensify/design` so the design team can review the changes.
- [ ] If a new page is added, I verified it's using the `ScrollView` component to make it scrollable when more elements are added to the page.
- [ ] I added [unit tests](https://github.com/Expensify/App/blob/main/tests/README.md) for any new feature or bug fix in this PR to help automatically prevent regressions in this user flow.
- [ ] If the `main` branch was merged into this PR after a review, I tested again and verified the outcome was still expected according to the `Test` steps.

### Screenshots/Videos
<details>
<summary>Android: Native</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>Android: mWeb Chrome</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>iOS: Native</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>iOS: mWeb Safari</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>MacOS: Chrome / Safari</summary>

<!-- add screenshots or videos here -->

</details>