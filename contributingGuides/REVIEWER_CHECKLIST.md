## Reviewer Checklist

- [ ] I have verified the author checklist is complete (all boxes are checked off).
- [ ] I verified the correct issue is linked in the `### Fixed Issues` section above
- [ ] I verified testing steps are clear and they cover the changes made in this PR
    - [ ] I verified the steps for local testing are in the `Tests` section
    - [ ] I verified the steps for Staging and/or Production testing are in the `QA steps` section
    - [ ] I verified the steps cover any possible failure scenarios (i.e. verify an input displays the correct error message if the entered data is not correct)
    - [ ] I turned off my network connection and tested it while offline to ensure it matches the expected behavior (i.e. verify the default avatar icon is displayed if app is offline)
- [ ] I checked that screenshots or videos are included for tests on [all platforms](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [ ] I included screenshots or videos for tests on [all platforms](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [ ] I verified that the composer does not automatically focus or open the keyboard on mobile unless explicitly intended. This includes checking that returning the app from the background does not unexpectedly open the keyboard.
- [ ] I verified tests pass on **all platforms** & I tested again on:
    - [ ] Android: HybridApp
    - [ ] Android: mWeb Chrome
    - [ ] iOS: HybridApp
    - [ ] iOS: mWeb Safari
    - [ ] MacOS: Chrome / Safari
- [ ] If there are any errors in the console that are unrelated to this PR, I either fixed them (preferred) or linked to where I reported them in Slack
- [ ] I verified there are no new alerts related to the `canBeMissing` param for `useOnyx`
- [ ] I verified proper code patterns were followed (see [Reviewing the code](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
    - [ ] I verified that any callback methods that were added or modified are named for what the method does and never what callback they handle (i.e. `toggleReport` and not `onIconClick`).
    - [ ] I verified that comments were added to code that is not self explanatory
    - [ ] I verified that any new or modified comments were clear, correct English, and explained "why" the code was doing something instead of only explaining "what" the code was doing.
    - [ ] I verified any copy / text shown in the product is localized by adding it to `src/languages/*` files and using the [translation method](https://github.com/Expensify/App/blob/4510fc76bbf5df699a2575bfb49a276af90f3ed7/src/components/LocaleContextProvider.tsx#L80)
    - [ ] I verified all numbers, amounts, dates and phone numbers shown in the product are using the [localization methods](https://github.com/Expensify/App/blob/4510fc76bbf5df699a2575bfb49a276af90f3ed7/src/components/LocaleContextProvider.tsx#L116-L123)
    - [ ] I verified any copy / text that was added to the app is grammatically correct in English. It adheres to proper capitalization guidelines (note: only the first word of header/labels should be capitalized), and is either coming verbatim from figma or has been approved by marketing (in order to get marketing approval, ask the Bug Zero team member to add the Waiting for copy label to the issue)
    - [ ] I verified proper file naming conventions were followed for any new files or renamed files. All non-platform specific files are named after what they export and are not named "index.js". All platform-specific files are named for the platform the code supports as outlined in the README.
    - [ ] I verified the JSDocs style guidelines (in [`STYLE.md`](https://github.com/Expensify/App/blob/main/contributingGuides/STYLE.md#jsdocs)) were followed
- [ ] If a new code pattern is added I verified it was agreed to be used by multiple Expensify engineers
- [ ] I verified that this PR follows the guidelines as stated in the [Review Guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md)
- [ ] I verified other components that can be impacted by these changes have been tested, and I retested again (i.e. if the PR modifies a shared library or component like `Avatar`, I verified the components using `Avatar` have been tested & I retested again)
- [ ] I verified all code is DRY (the PR doesn't include any logic written more than once, with the exception of tests)
- [ ] I verified any variables that can be defined as constants (ie. in CONST.ts or at the top of the file that uses the constant) are defined as such
- [ ] If a new component is created I verified that:
    - [ ] A similar component doesn't exist in the codebase
    - [ ] All props are defined accurately and each prop has a `/** comment above it */`
    - [ ] The file is named correctly
    - [ ] The component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone
    - [ ] The only data being stored in the state is data necessary for rendering and nothing else
    - [ ] For Class Components, any internal methods passed to components event handlers are bound to `this` properly so there are no scoping issues (i.e. for `onClick={this.submit}` the method `this.submit` should be bound to `this` in the constructor)
    - [ ] Any internal methods bound to `this` are necessary to be bound (i.e. avoid `this.submit = this.submit.bind(this);` if `this.submit` is never passed to a component event handler like `onClick`)
    - [ ] All JSX used for rendering exists in the render method
    - [ ] The component has the minimum amount of code necessary for its purpose, and it is broken down into smaller components in order to separate concerns and functions
- [ ] If any new file was added I verified that:
    - [ ] The file has a description of what it does and/or why is needed at the top of the file if the code is not self explanatory
- [ ] If a new CSS style is added I verified that:
    - [ ] A similar style doesn't already exist
    - [ ] The style can't be created with an existing [StyleUtils](https://github.com/Expensify/App/blob/main/src/utils/index.ts) function (i.e. `StyleUtils.getBackgroundAndBorderStyle(theme.componentBG`)
- [ ] If the PR modifies code that runs when editing or sending messages, I tested and verified there is no unexpected behavior for all supported markdown - URLs, single line code, code blocks, quotes, headings, bold, strikethrough, and italic.
- [ ] If the PR modifies a generic component, I tested and verified that those changes do not break usages of that component in the rest of the App (i.e. if a shared library or component like `Avatar` is modified, I verified that `Avatar` is working as expected in all cases)
- [ ] If the PR modifies a component related to any of the existing Storybook stories, I tested and verified all stories for that component are still working as expected.
- [ ] If the PR modifies a component or page that can be accessed by a direct deeplink, I verified that the code functions as expected when the deeplink is used - from a logged in and logged out account.
- [ ] If the PR modifies the UI (e.g. new buttons, new UI components, changing the padding/spacing/sizing, moving components, etc) or modifies the form input styles:
    - [ ] I verified that all the inputs inside a form are aligned with each other.
    - [ ] I added `Design` label and/or tagged `@Expensify/design` so the design team can review the changes.
- [ ] If a new page is added, I verified it's using the `ScrollView` component to make it scrollable when more elements are added to the page.
- [ ] For any bug fix or new feature in this PR, I verified that sufficient [unit tests](https://github.com/Expensify/App/blob/main/tests/README.md) are included to prevent regressions in this flow.
- [ ] If the `main` branch was merged into this PR after a review, I tested again and verified the outcome was still expected according to the `Test` steps.
- [ ] I have checked off every checkbox in the PR reviewer checklist, including those that don't apply to this PR.

### Screenshots/Videos
<details>
<summary>Android: HybridApp</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>Android: mWeb Chrome</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>iOS: HybridApp</summary>

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
