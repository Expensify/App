# PR review guidelines

This document lists specific guidelines for all PR reviews and aims to clarify items in the PR template checklist.

# Check PR template

1. Make sure the “Fixed Issues” section is formatted correctly. Links should be clickable and lead to the correct issue being fixed by this PR.
2. Make sure the testing steps are clear and correctly test the changes made. Make note of what’s required for the test account (i.e. do you need to test using a brand new account, have a workspace, have a bank account, etc).
    - > **Rule of thumb**: Over-explain what the tester needs to do. Do not rely on the tester having existing knowledge of the app.
      > 
      > ### Example of bad steps:
      >
	  >	1. Go to this page
	  >	2. Click the button
      >
      > ### Example of good steps:
      >
      > 1. Log in with an account that has a workspace, or follow `[these steps](link-to-instructions-for setting-up-workspace)` to make one.
      > 2. Click the settings button on the top left (the one with your avatar)
      > 3. Navigate to “Your Workspace” > Reimburse Receipts > Connect bank account
      > 4. Verify that the bank account view opens without errors
      >
    - Take note of the distinction between testing _locally_ and _on staging_. Note: The staging site references the production version of the API.
3. Make sure that the test includes both **success** and **fail** scenarios.
    - Ex: if the issue was to prevent the user from saving a field when it is empty, besides testing that we should also test that they can save the field _if it is not empty_.

# Testing the changes

1. Make sure there are no console errors related to the PR. If you find console errors in a branch you’re reviewing, check if they also exist in `main`.
    1. If they do, proceed as normal (report them in #expensify-open-source if you think they need to be fixed).
    2. If the errors do not exist in `main`, report it to the PR author - they need to be fixed before the PR can be merged.
2. Test the changes on **all platforms**. Follow this guide (needs link) to set up each platform.
    - If you’re unable to boot a platform for any reason, ask for help in the #expensify-open-source Slack channel. Your issue might already have been addressed there, so be sure to search first.

# Reviewing the code

## Good code patterns to require

1. Check that functions have comments when appropriate.
    - If the function has params or returns something, use [JSDocs syntax]((https://github.com/Expensify/App/blob/main/contributingGuides/STYLE.md#jsdocs)) to describe them.
        - Indicate the param name(s), data type passed and / or returned, and purpose if not immediately obvious.
    - Obvious functions (with no params / return value) should not have comments.
    - **In short: _Add comments & docs, only when useful._**
2. All copy / text shown to users in the product should be stored in the `src/languages/*` files for localization.
3. Platform-specific files should follow the proper naming convention (see [Platform-Specific File Extensions](https://github.com/expensify/app#platform-specific-file-extensions))
    - Example: `MyComponent/index.android.js`

## Code patterns to improve

1. Platform-specific solutions should not be applied to more platforms than necessary
    - E.g. solutions for Android or iOS should go in specific `index.android.js` or `index.ios.js` files, not in an `index.native.js` file.
2. Were any new styles added? Are we following the guidelines in [`STYLING.md`](./STYLING.md)?

## Code patterns to avoid

1. Make sure any `setTimeout`s are absolutely necessary, not just a workaround for a situation that isn’t fully understood (e.g. a race condition).
2. Ensure Onyx is used appropriately. ([docs](https://github.com/expensify/react-native-onyx#merging-data))

## Considerations around code reuse

While trying to keep our code DRY (don't repeat yourself), you may find yourself trying to decide between refactoring & reusing a component vs. creating a brand new component. When in doubt about whether something should be reused or refactored, ask for help.

Here are some guidelines we use in order to make the best decisions:

1. Specialization
    - When one component is a special case of another, we should opt for the technique of composition. Here are the [React docs](https://reactjs.org/docs/composition-vs-inheritance.html#specialization) on Specialization. The idea is that it’s better to establish a pattern of creating increasingly specific components, instead of adding dozens of use cases to a single component.
    - You might consider this when a component is being reused because the new use case is “close enough” to the original. Rather than adding functionality to that component with subtle additions, it may be better to create a new, more specialized version of that component.
1. Refactors
    - During a code review it often becomes apparent that a refactor is needed. In this case, we recommend following these steps:
        1. Identify the refactor and confirm with others that it’s needed.
        2. Do that refactor first (as a separate job, if it qualifies), merge it, test for regressions.
        3. Proceed with the original issue & job.
