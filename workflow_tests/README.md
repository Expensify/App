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
  - `workflow_tests/` - workflow testing folder
    - `jest.config.ts` - `Jest` configuration file
    - `README.md` - this readme file
    - `utils.js` - various utility functions used in multiple tests
    - `<workflow_name>.test.js` - test suite file for a GitHub Actions workflow named `<workflow_name>`
    - `mocks/` - folder with step mock definitions
      - `<workflow_name>Mocks.js` - file with step mock definitions for the `../<workflow_name>.test.js` suite, or for the `<workflow_name>` workflow
      - `...` - other step mock definition files
    - `assertions/` - folder with output assertions
      - `<workflow_name>Assertions.js` - file with output assertions for the `../<workflow_name>.test.js` suite, or for the `<workflow_name>` workflow
      - `...` - other output assertion files
    - `...` - other test suites
  - `...` - other application files

## Utility helpers
`utils.js` file provides several helper methods to speed up the tests development and maintenance

### `setUpActParams`
`setUpActParams` allows for initiating the context in which Act will execute the workflow

Parameters:
- `act` - instance of previously created `Act` object that will be updated with new params
- `event` - the name of the event, this can be any event name used by GitHub Actions, like `pull_request`, `push`, `workflow_dispatch`, etc.
- `event_options` - object with options of the event, allowing for customising it for different scenarios, for example `push` event can be customised for pushing to different branches with options `{head: {ref: '<branch_name>'}}`
- `secrets` - object with secret values provided, like `{<SECRET_NAME>: <secret_value>, ...}`
- `github_token` - value of the GitHub token, analogous to providing `GITHUB_TOKEN` secret

Returns an updated `Act` object instance

Example:
```javascript
let act = new kieActJs.Act(repoPath, workflowPath);
act = utils.setUpActParams(
    act,
    'push',
    {head: {ref: 'main'}},
    {OS_BOTIFY_TOKEN: 'dummy_token', GITHUB_ACTOR: 'Dummy Tester', SLACK_WEBHOOK: 'dummy_slack_webhook', LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_s3cr3t_p455word'},
    'dummy_github_token',
);
```

### `getMockStep`
`getMockStep` allows for creating uniform mock step definitions compatible with `Act-js` and reduces time required, as well as possibility of errors/typos slipping in while developing tests. More complex behaviours have to be mocked manually

Parameters:
- `name` - name of the step that **must correspond to the `name` in the `<workflow>.yml` file**, otherwise the step cannot be found
- `message` - the message to be printed to default output when mock gets executed
- `job_id` - an optional id of the job that will be printed in `[]` square brackets along the `message`, useful when assessing the output with many steps from many jobs
- `inputs` - a list of input parameters to be printed, useful when checking if the step had been executed with expected inputs
- `in_envs` - a list of input environment variables, to be printed, useful when checking if the step had been executed in expected environment
- `outputs` - an object with values which should be printed by the mock to `$GITHUB_OUTPUT`, useful for setting the step output
- `out_envs` - an objects with values of environment variables set by the step in `$GITHUB_ENV`, useful for modifying the environment by the mock
- `isSuccessful` - a boolean value indicating whether the step succeeds or not, exits with status `0` (if successful) or `1` (if not)

Returns an object with step mock definition, ready to be provided to the `Act` object instance

Example:
```javascript
let mockStep = utils.getMockStep(
    'Name of the step from <workflow>.yml',
    'Message to be printed',
    'TEST_JOB',
    ['INPUT_1', 'INPUT_2'],
    ['ENV_1', 'ENV_2'],
    {output_1: true, output_2: 'Some Result'},
    {OUT_ENV: 'ENV_VALUE'},
    false,      
);
```
results in
```javascript
{
    name: 'Name of the step from <workflow>.yml',
    mockWith: 'echo [MOCK]'
        + ' [TEST_JOB]'
        + ' Message to be printed'
        + ', INPUT_1="{{ inputs.INPUT_1 }}'
        + ', INPUT_2="{{ inputs.INPUT_2 }}'
        + ', ENV_1="{{ env.ENV_1 }}'
        + ', ENV_1="{{ env.ENV_1 }}'
        + '\necho "output_1=true" >> "$GITHUB_OUTPUT"',
        + '\necho "output_2=Some Result" >> "$GITHUB_OUTPUT"',
        + '\necho "OUT_ENV=ENV_VALUE" >> "$GITHUB_ENV"',
        + '\nexit 1',
}
```

### `getStepAssertion`
`getStepAssertion` allows for creating uniform assertions for output from executed step, compatible with step mocks provided by `getMockStep`

Parameters:
- `name` - name of the step, **has to correspond to the name from `<workflow>.yml` file**, and the name in the step mock if applicable
- `isSuccessful` - boolean value for checking if the step should have exited successfully
- `expectedOutput` - an output that is expected from the step, compared directly - if provided the subsequent parameters are ignored
- `jobId` - an optional expected job identifier
- `message` - expected message printed by the step
- `inputs` - expected input values provided to the step
- `envs` - expected input environment variables for the step

Returns an object with step expected output definition ready to be provided to `expect()` matcher

Example:
```javascript
utils.getStepAssertion(
    'Name of the step from <workflow>.yml',
    false,
    null,
    'TEST_JOB',
    'Message to be printed',
    [{key: 'INPUT_1', value: true}, {key: 'INPUT_2', value: 'Some value'}],
    [{key: 'PLAIN_ENV_VAR', value: 'Value'}, {key: 'SECRET_ENV_VAR', value: '***'}],
)
```
results in
```javascript
{
    name: 'Name of the step from <workflow>.yml',
    status: 1,
    output: '[MOCK]'
        + ' [TEST_JOB]'
        + ' Message to be printed'
        + ', INPUT_1=true'
        + ', INPUT_2=Some value'
        + ', PLAIN_ENV_VAR=Value'
        + ', SECRET_ENV_VAR=***',
}
```
