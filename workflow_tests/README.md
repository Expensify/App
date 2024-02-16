# Testing GitHub Actions workflows locally

## Components
The workflow testing framework consists mainly of 3 components:
- [Jest](https://jestjs.io/) - testing framework, also used for [application tests](https://github.com/Expensify/App/tree/main/tests)
- [Mock-github](https://github.com/kiegroup/mock-github) - package allowing for creation of local repositories, which can be used to make sure that the workflow tests have access only to these files that they should and that they won't modify the actual repository
- [Act-js](https://github.com/kiegroup/act-js) - JS wrapper around [Act](https://github.com/nektos/act). Act is a tool that allows to run GitHub Actions workflows locally, and Act-js allows to configure and run Act from JS code, like Jest tests. It also provides additional tools like mocking workflow steps and retrieving the workflow output a JSON, which allows for comparison of the actual output with expected values

## Setup
- Install dependencies from `package.json` file with `npm install`
- Make sure you have fulfilled the [prerequisites](https://github.com/nektos/act#necessary-prerequisites-for-running-act) for running `Act`
- Install `Act` with `brew install act` and follow the documentation on [first Act run](https://github.com/nektos/act#first-act-run)
- Set the environment variable `ACT_BINARY` to the path to your `Act` executable (`which act` if you're not sure what the path is)
- You should be ready to run the tests now with `npm run workflow-test`
- You can pre-generate new mocks/assertions/test files for a given workflow by running `npm run workflow-test:generate <workflow_file>`

## Running
- To run the workflow tests simply use
  - `npm run workflow-test`
  - this will run all the tests sequentially, which can take some time
- To run a specific test suite you can use
  - `npm run workflow-test -- -i <path_to_test_file>`
  - this will run only the test from that specific test file
- To run a specific test or subset of tests use
  - `npm run workflow-test -- -t "<test_name_substring>"`
  - this will run only the tests having `<test_name_substring>` in their name/description
- You can combine these like `npm run workflow-test -- -i workflow_tests/preDeploy.test.js -t "single specific test"`
- You can also use all other options which are normally usable with `jest`

## Limitations
Not all workflows can always be tested this way, for example:
- Act and Act-js do not support all the runner types available in GitHub Actions, like `macOS` runners or some specific version of `Ubuntu` runners like `ubuntu-20.04-64core`. In these cases the job will be omitted entirely and cannot be tested
- Testing more complex workflows in their entirety can be extremely time-consuming and cumbersome. It is often optimal to mock most of the steps with expressions printing the input and output conditions
- Due to the way `Act` and `Act-js` handle workflow output, not much can be checked in the test. What is available, namely whether the job/step executed or not, whether it was successful or not and what its printed output was, should be enough in most scenarios
- `Act` does not seem to support the conditions set on event parameters when determining whether to run the workflow or not, namely for a workflow defined with:
```yaml
on:
  pull_request:
    types: [opened, edited, reopened]
```
running `act pull_request -e event_data.json` with `event_data.json` having `{"action": "opened"}` will execute the workflow (as expected), running for example `act push` will not execute it (as expected), but running `act pull_request -e event_data.json` with `event_data.json` having for example `{"action": "assigned"}` **will still execute the workflow** even though it should only be executed with `action` being `opened`, `edited` or `reopened`. This only applies to running the workflow with `Act`, in the GitHub environment it still works as expected

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

### `createMockStep`
`createMockStep` allows for creating uniform mock step definitions compatible with `Act-js` and reduces time required, as well as possibility of errors/typos slipping in while developing tests. More complex behaviours have to be mocked manually

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
let mockStep = utils.createMockStep(
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

### `createStepAssertion`
`createStepAssertion` allows for creating uniform assertions for output from executed step, compatible with step mocks provided by `createMockStep`

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
utils.createStepAssertion(
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

### `setJobRunners`
`setJobRunners` overwrites the runner types for given jobs, helpful when the runner type in the workflow is not supported by `Act`

Parameters:
- `act` - instance of previously created `Act` object
- `jobs` - object with keys being the IDs of the workflow jobs to be modified and values being the names of runners that should be used for them in the test
- `workflowPath` - path to the workflow file to be updated, **NOTE**: this will modify the file, use the one from the local test repo, not from `App/.github/workflows`!

Returns an `Act` object instance

Let's say you have a workflow with a job using `macos-12` runner, which is unsupported by `Act` - in this case that job will simply be skipped altogether, not allowing you to test it in any way.
```yaml
iOS:
  name: Build and deploy iOS
  needs: validateActor
  if: ${{ fromJSON(needs.validateActor.outputs.IS_DEPLOYER) }}
  runs-on: macos-12
  steps:
```
You can use this method to change the runner to something that is supported, like
```javascript
act = utils.setJobRunners(
    act,
    {
        iOS: 'ubuntu-latest',
    },
    workflowPath,
);
```
Now the test workflow will look as follows, which will allow you to run the job and do at least limited testing
```yaml
iOS:
  name: Build and deploy iOS
  needs: validateActor
  if: ${{ fromJSON(needs.validateActor.outputs.IS_DEPLOYER) }}
  runs-on: ubuntu-latest
  steps:
```

## Typical test file
The following is the typical test file content, which will be followed by a detailed breakdown
```javascript
const path = require('path');
const kieActJs = require('@kie/act-js');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils');
const assertions = require('./assertions/<workflow>Assertions');
const mocks = require('./mocks/<workflow>Mocks');

let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    {
        src: path.resolve(__dirname, '..', '.github', 'actions'),
        dest: '.github/actions',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'libs'),
        dest: '.github/libs',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'scripts'),
        dest: '.github/scripts',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', '<workflow>.yml'),
        dest: '.github/workflows/<workflow>.yml',
    },
];

beforeEach(async () => {
    mockGithub = new kieMockGithub.MockGithub({
        repo: {
            testWorkflowsRepo: {
                files: FILES_TO_COPY_INTO_TEST_REPO,
            },
        },
    });

    await mockGithub.setup();
});

afterEach(async () => {
    await mockGithub.teardown();
});

describe('test some general behaviour', () => {
    test('something happens - test if expected happened next', async () => {
        // get path to the local test repo
        const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';

        // get path to the workflow file under test
        const workflowPath = path.join(repoPath, '.github', 'workflows', '<workflow>.yml');

        // instantiate Act in the context of the test repo and given workflow file
        let act = new kieActJs.Act(repoPath, workflowPath);

        // set run parameters
        act = utils.setUpActParams(
            act,
            '<event>',
            {head: {ref: '<branch_name>'}},
            {'<SECRET_NAME>': '<secret_value'},
            '<github_token>',
        );

        // set up mocks
        const testMockSteps = {
            '<job_1_name>': [
                {
                    name: '<step_1_1_name>',
                    mockWith: '<mock_command>',
                },
                {
                    name: '<step_1_2_name>',
                    mockWith: '<mock_command>',
                },
            ],
            '<job_2_name>': [
                utils.createMockStep('<step_2_1_name>', '<message>'),
                utils.createMockStep('<step_2_2_name>', '<message>'),
            ],
        };

        // run an event and get the result
        const result = await act
            .runEvent('<event>', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
            });

        // assert results (some steps can run in parallel to each other so the order is not assured
        // therefore we can check which steps have been executed, but not the set job order
        assertions.assertSomethingHappened(result);
        assertions.assertSomethingDidNotHappen(result, false);
    }, timeout);
);
```

### Breakdown
Define which files should be copied into the test repo. In this case we copy `actions`, `libs`, `scripts` folders in their entirety and just the one workflow file we want to test
```javascript
const FILES_TO_COPY_INTO_TEST_REPO = [
    {
        src: path.resolve(__dirname, '..', '.github', 'actions'),
        dest: '.github/actions',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'libs'),
        dest: '.github/libs',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'scripts'),
        dest: '.github/scripts',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', '<workflow>.yml'),
        dest: '.github/workflows/<workflow>.yml',
    },
];
```
`beforeEach` gets executed before each test. Here we create the local test repository with the files defined in the `FILES_TO_COPY_INTO_TEST_REPO` variable. `testWorkflowRepo` is the name of the test repo and can be changed to whichever name you choose, just remember to use it later when accessing this repo. _Note that we can't use `beforeAll()` method, because while mocking steps `Act-js` modifies the workflow file copied into the test repo and thus mocking could persist between tests_
```javascript
beforeEach(async () => {
    mockGithub = new kieMockGithub.MockGithub({
        repo: {
            testWorkflowsRepo: {
                files: FILES_TO_COPY_INTO_TEST_REPO,
            },
        },
    });

    await mockGithub.setup();
});
```
Similarly, `afterEach` gets executed after each test. In this case we remove the test repo after the test finishes
```javascript
afterEach(async () => {
    await mockGithub.teardown();
});
```
Get path to the local test repo, useful to have it in a variable
```javascript
const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';
```
Get path to the workflow under test. Note that it's the path **in the test repo**
```javascript
const workflowPath = path.join(repoPath, '.github', 'workflows', '<workflow>.yml');
```
Instantiate `Act` object instance. Here we provide the constructor with the path to the test repo (so that `Act` can execute in its context) and the path the workflow file under test (so just the workflow we want to test would be executed)
```javascript
let act = new kieActJs.Act(repoPath, workflowPath);
```
Set up initial parameters for `Act`. This is where we can set secrets, GitHub token and options for the events (like the name of the branch to which the push has been made, etc.)
```javascript
act = utils.setUpActParams(
    act,
    '<event>',
    {head: {ref: '<branch_name>'}},
    {'<SECRET_NAME>': '<secret_value'},
    '<github_token>',
);
```
Set up step mocks. Here we configure which steps in the workflow should be mocked, and with what behaviour. This takes form of an object with keys corresponding to the names of the jobs in the workflow, and values being mock definitions for specific steps. The steps can be identified either by `id`, `name`, `uses` or `run`. Step mock can be defined either by hand (`<job_1_name>`) or with the helper method `utils.createMockStep()` (`<job_2_name>`). Not mocked steps will be executed normally - **make sure this will not have unexpected consequences**
```javascript
const testMockSteps = {
    '<job_1_name>': [
        {
            name: '<step_1_1_name>',
            mockWith: '<mock_command>',
        },
        {
            name: '<step_1_2_name>',
            mockWith: '<mock_command>',
        },
    ],
    '<job_2_name>': [
        utils.createMockStep('<step_2_1_name>', '<message>'),
        utils.createMockStep('<step_2_2_name>', '<message>'),
    ],
};
```
Most important part - actually running the event with `Act`. This executes the specified `<event>` in the context of the local test repo created before and with the workflow under test set up. `result` stores the output of `Act` execution, which can then be compared to what was expected. Note that the `workflowFile` is actually path to _workflow folder_ and not the file itself - `Act-js` determines the name of the workflow by itself, and tries to find it in the specified `workflowFile` path, so _providing the full path to the file will fail_
```javascript
const result = await act
    .runEvent('<event>', {
        workflowFile: path.join(repoPath, '.github', 'workflows'),
        mockSteps: testMockSteps,
    });
```
Assert results are as expected. This can, for example, include using `expect()` to check if the steps that should be executed have indeed been executed, steps that shouldn't run have not been executed, compare statuses (which steps succeeded, which failed) and step outputs. Outputs can include additional information, like input values, environmental variables, secrets (although these are usually not accessible and represented by `***`, this can still be useful to check if the value exists or not). Here it's usually done with the helper assertion methods defined in the assertions file. Step assertions can be created manually or with `createStepAssertion()` helper method
```javascript
assertions.assertSomethingHappened(result);
assertions.assertSomethingDidNotHappen(result, false);
```

## FAQ
### I'm positive that one of the jobs should run, but it doesn't - why?
#### Check the runner type (`runs-on`) it may not be set (which `Act` does not like) or it may be set to one of the unsupported types (primarily the `macos-...` runner types). You can always overwrite the runner type with `utils.setJobRunners()` helper method
### My workflow has many jobs, each with many steps, how do I start testing it without spending hours on setup?
#### First of all, consider splitting the workflow into several smaller pieces, with the main one acting as coordinator and calling the others. Secondly, you can bootstrap the test with `npm run workflow-test:generate <workflow>.yml`, which will generate mocks and assertions for you, as well as the stub of the test file
### After using `workflow-test:generate` the files are incomplete, or they have errors. Why?
#### Make sure that the workflow file you want to test, has all steps with names, as the bootstrapping script uses step names to locate and mock them - same with assertions. After you've added the `name` properties to steps, remove the previously generated files and run the command again
### I want to just run the test that I am working on, without all the others - how can I do it?
#### You can pass parameters to the `npm run workflow-test` command as you would with `jest` or `npm test` - `npm run workflow-test -- -i <path/to/testfile>` will run just the tests within `testfile`. You can also filter further with `-t <part_of_test_name>`
