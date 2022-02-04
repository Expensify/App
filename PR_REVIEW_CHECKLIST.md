# PR review checklist

This document lists specific checks that should be done when reviewing a PR. This means these items should be checked by:
1. Every contributor submitting a Pull Request
2. Every C+ (Contributor Plus) team member reviewing a PR
3. Every Expensify employee submitting / reviewing a PR

This is a living document, so we will be updating this from time to time. Feel free to suggest additions or changes in the #expensify-open-source Slack channel.

# Check PR template

1. Make sure the PR template includes screenshots or videos of the changes being tested on **all platforms**. If there are one or more platforms missing, follow up with the contributor to determine why - we shouldn't be merging changes that aren't tested everywhere.
    - Feel free to ask for help on how to test changes on all platforms.
2. Make sure the “Fixed Issues” section is formatted correctly. Links should be clickable and lead to the correct issue being fixed by this PR.
3. Make sure the testing steps are clear and correctly test the changes made. Make note of what’s required for the test account (i.e. do you need to test using a brand new account, have a workspace, have a bank account, etc).
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
4. Make sure the testing steps also cover possible regressions.
    1. Cases where we definitely need new regression tests:
        1. Building a new page
        2. Building a new feature
        3. Building a new component?
    2. Cases where we might need new regression tests:
        1. Bug was easy to find
5. Make sure that the test includes both **success** and **fail** scenarios.
    - Ex: if the issue was to prevent the user from saving a field when it is empty, besides testing that we should also test that they can save the field _if it is not empty_.

# Testing the changes

1. Make sure there are no console errors related to the PR. If you find console errors in a branch you’re reviewing, check if they also exist in `main`.
    1. If they do, proceed as normal (report them in #expensify-open-source if you think they need to be fixed).
    2. If the errors do not exist in `main`, report it to the PR author - they need to be fixed before the PR can be merged.
2. Test the changes on **all platforms**. Follow this guide (needs link) to set up each platform.
    - If you’re unable to boot a platform for any reason, ask for help in the #expensify-open-source Slack channel. Your issue might already have been addressed there, so be sure to search first.
3. Should we add regression testing for code introduced in this PR?
    - If the PR introduces **new** pages, features, etc. then we **should** have new regression tests written. Please note this in your PR so that Applause can make sure it gets added.
    - If the PR fixes a bug, Applause will check to make sure the existing regression testing steps already cover the workflow fixed by the bug.

# Reviewing the code

## Good code patterns to require

1. Check that functions have comments when appropriate.
    - If the function has params or returns something, use JSDocs syntax to describe them.
        - Indicate the param name(s), data type passed and / or returned, and purpose if not immediately obvious.
    - Obvious functions (with no params / return value) should not have comments.
    - **In short: _Add comments & docs often, only when useful._**
2. All copy / text shown to users in the product should be stored in the `src/languages/*` files for localization.
3. Platform-specific files should follow the proper naming convention (see [Platform-Specific File Extensions](https://github.com/expensify/app#platform-specific-file-extensions))
    - Example: `MyComponent/index.android.js`

## Code patterns to check for improvement

1. Is there appropriate error handling?
2. Reuse...
3. Are there any changes that could've been applied to one component that were applied to every usage of the component instead?
    - Example: https://github.com/Expensify/App/pull/3129#pullrequestreview-668271068
4. Ensure fixes for just android or ios aren't put in a `index.native.js`. Instead they should be in a specific `index.ios.js` or `index.android.js` file.
    - Put another way, ensure platform-specific solutions are not applied cross-platform.
5. Look for usages of react fragment wrappings and confirm they are necessary.
    - Also look for any unnecessary `View`s and think if they should be replaced with React fragments.
6. Were any new styles added? Can we reuse existing styles instead? Can we generalize the new style?

## Code patterns to avoid

1. Make sure any `setTimeout`s are absolutely necessary, not just a workaround for a situation that isn’t fully understood.
2. Ensure Onyx is used appropriately. ([docs](https://github.com/expensify/react-native-onyx#merging-data))
3. Don't mention the `isSmallScreenWidth` prop type explicitly in any component, use `...windowDimensionsPropTypes` instead.

## Considerations around code reuse

While trying to keep our code DRY (don't repeat yourself), you may find you're walking a thin line between refactoring & reusing a component vs. creating a brand new component. Here are some guidelines we use - they're not hard and fast rules, so please feel free to post in #expensify-open-source to gather peer opinions in order to make the best decisions.

1. Specialization
    - When one component is a special case of another, we should opt for the technique of composition. Here are the [React docs](https://reactjs.org/docs/composition-vs-inheritance.html#specialization) on Specialization. The idea is that it’s better to establish a pattern of creating increasingly specific components, instead of adding dozens of use cases to a single component.
    - You might consider this when a component is being reused because the new use case is “close enough” to the original. Rather than adding functionality to that component with subtle additions, it may be better to create a new, more sprecialized version of that component.
1. Refactors
    - During a code review it becomes apparent that a refactor is needed. In this case, we recommend following these steps:
        1. Identify the refactor and confirm with others that it’s needed.
        2. Do that refactor first (as a separate job, if it qualifies), merge it, test for regressions.
        3. Proceed with the original issue.

# Submit / approve the PR

While the steps above can be tedious to follow the first time you submit or review a PR, over time they will become more natural. The goal of these steps is to make sure we create the best product, with the best engineers writing the best code.
