# Directory Structure and File Naming Philosophy
Learn how files are organized in the project.

## General Philosophy
This is how things should be organized from a conceptual level:

- Start by page (`src/page/whatever`) which correlates to a good name indicating what the page is (eg: `report`, `account`, `workspace`,) ideally and if the route is not a short form one (eg: `/r/`, `/a/`), it should also match the route
  - Pieces of the page should be put into sub-folders of the page
  - Anything that is built ONLY for this page should go in the page directory (hooks and components included)
  - Any component that is general enough to be reused elsewhere should go in `src/components`
  - If multiple files are needed for a component, put them in their own folder (eg. `src/components/button`)
    - Any hook that is general enough to be reused elsewhere should go in `src/hooks`
- All non-UI files should go in `src/libs`
  - All action files should go in `src/libs/actions`

### RULES
#### - Directory names MUST be camel-case
#### - Directory names SHOULD be plural
#### - Page components MUST have the "Page" suffix (ie. `ConciergePage`)
#### - Components used in a specific page SHOULD live in it's own sub-directory named after the page

## `/src`
All of the source code for the app is here.

### `/src/components`
React components that are re-used in several places across the application are stored here.

### `/src/libs`
Non-React components that contain the business logic of the app.

### `/src/pages`
React components that are organized by the hierarchy of the app. A "page" is the top-most UI controller for a given URL.

### `/src/styles`
All the styles used in the application are here.

## `/.github`
GitHub-specific configurations, workflows, and actions for CI/CD and repository automation.

### `/.github/workflows`
Contains all GitHub Actions workflow definitions that automate our CI/CD processes, including builds, tests, deployments, and various checks. See the [workflows README](.github/workflows/README.md) for detailed documentation.

### `/.github/actions`
Custom GitHub Actions that provide reusable functionality for our workflows. These are organized into:
- `composite/` - Composite actions that combine multiple workflow steps
- `javascript/` - JavaScript actions for more complex logic

### `/.github/scripts`
Shell scripts and utilities used by workflows and actions for various automation tasks.

### `/.github/libs`
Shared TypeScript/JavaScript libraries and utilities used by our custom GitHub Actions.

## `/contributingGuides`
Guides and insights to aid developers in learning how to contribute to this repo

## `/docs`
This houses the Expensify Help site. It's a static site that's built with Jekyll and hosted on GitHub Pages.

## `/help`
This houses a secondary and experimental help site. It's primarily used for the right-hand-pane help articles. It's a static site that's built with Jekyll and hosted on GitHub Pages.

# File naming/structure

### Rules
#### - Files MUST be named after the component/function/constants they export, respecting the casing used for it. ie:

- An exported constant named `CONST` is in a file named `CONST`.
- A component named `Text` is in a file named `Text`.
- An exported function named `guid` is in a file named `guid`.
- For files that are utilities that export several functions/classes use the UpperCamelCase version ie: `DateUtils`.
- [Higher-Order Components](https://reactjs.org/docs/higher-order-components.html) (HOCs) and hooks should be named in camelCase, like `withPolicy` and `useOnyx`.
