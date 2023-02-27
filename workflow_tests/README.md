# Testing GitHub Actions workflows locally

## Components

The workflow testing framework consists mainly of 3 components:

- [Jest](https://jestjs.io/) - testing framework, also used for [application tests](https://github.com/Expensify/App/tree/main/tests)
- [Mock-github](https://github.com/kiegroup/mock-github) - package allowing for creation of local repositories, which can be used to make sure that the workflow tests have access only to these files that they should and that they won't modify the actual repository
- [Act-js](https://github.com/kiegroup/act-js) - JS wrapper around [Act](https://github.com/nektos/act). Act is a tool that allows to run GitHub Actions workflows locally, and Act-js allows to configure and run Act from JS code, like Jest tests. It also provides additional tools like mocking workflow steps and retrieving the workflow output a JSON, which allows for comparison of the actual output with expected values

## Limitations

Not all workflows can always be tested this way, for example:

- Act and Act-js do not support all the runner types available in GitHub Actions, like `macOS` runners or some specific version of `Ubuntu` runners like `ubuntu-20.04-64core`. In these cases the job will be omitted entirely and cannot be tested
- Testing more complex workflows in their entirety can be extremely time-consuming and cumbersome. It is often optimal to mock most of the steps with expressions printing the input and output conditions
- Due to the way `Act` and `Act-js` handle workflow output, not much can be checked in the test. What is available, namely whether the job/step executed or not, whether it was successful or not and what its printed output was, should be enough in most scenarios

## File structure

The testing framework file structure within the repository is as follows:

- `App/` - main application folder
  - `.github/` - GitHub Actions folder
    - `workflows/` - workflows folder
      - `<workflow_name>.yml` - workflow file
      - `...` - other workflow files
    - `...` - other GitHub Actions files
  - `...` - other application files
  - `workflow_tests/` - workflow testing folder
    - `jest.config.ts` - `Jest` configuration file
    - `README.md` - this readme file
    - `utils.js` - various utility functions used in multiple tests
    - `<workflow_name>.test.js` - test suite file for a GitHub Actions workflow named `<workflow_name>`
    - `...` - other test suites
    - `mocks/` - folder with step mock definitions
      - `<workflow_name>Mocks.js` - file with step mock definitions for the `../<workflow_name>.test.js` suite, or for the `<workflow_name>` workflow
      - `...` - other step mock definition files
    - `assertions/` - folder with output assertions
      - `<workflow_name>Assertions.js` - file with output assertions for the `../<workflow_name>.test.js` suite, or for the `<workflow_name>` workflow
      - `...` - other output assertion files
