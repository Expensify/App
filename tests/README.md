# Tips on Writing Automated Tests in Jest

[Jest](https://jestjs.io/) is a testing framework we use to ensure our most mission critical libraries are as stable as possible. Here are a few things to consider with regards to our app's architecture when testing in Jest.

## Asynchronous Testing

- Much of the logic in the app is asynchronous in nature. [`react-native-onyx`](https://github.com/expensify/react-native-onyx) writes data async before updating subscribers.
- [Actions](https://github.com/Expensify/App#actions) do not typically return a `Promise` and therefore can't always be "awaited" before running an assertion.
- To test a result after some asynchronous code has run we can use [`Onyx.connect()`](https://github.com/Expensify/react-native-onyx/blob/2c94a94e51fab20330f7bd5381b72ea6c25553d9/lib/Onyx.js#L217-L231) and the helper method [`waitForBatchedUpdates()`](https://github.com/Expensify/ReactNativeChat/blob/ca2fa88a5789b82463d35eddc3d57f70a7286868/tests/utils/waitForBatchedUpdates.js#L1-L9) which returns a `Promise` and will ensure that all other `Promises` have finished running before resolving.
- **Important Note:** When writing any asynchronous Jest test it's very important that your test itself **return a `Promise`**.

## Mocking Network Requests

- Network requests called in tests do not run against any test database so we must [mock them](https://jestjs.io/docs/en/mock-functions) with a `jest.fn()`.
- To simulate a network request succeeding or failing we can mock the expected response first and then manually trigger the action that calls that API command.
- [Mocking the response of `HttpUtils.xhr()`](https://github.com/Expensify/App/blob/ca2fa88a5789b82463d35eddc3d57f70a7286868/tests/actions/SessionTest.js#L25-L32) is the best way to simulate various API conditions so we can verify whether a result occurs or not.

## Mocking collections / collection items

When unit testing an interface with Jest/performance testing with Reassure you might need to work with collections of data. These often get tricky to generate and maintain. To help with this we have a few helper methods located in `tests/utils/collections/`.

- `createCollection()` - Creates a collection of data (`Record<string, T>`) with a given number of items (default=500). This is useful for eg. testing the performance of a component with a large number of items. You can use it to populate Onyx.
- `createRandom*()` - like `createRandomPolicy`, these functions are responsible for generating a randomised object of the given type. You can use them as your defaults when calling `createCollection()` or as standalone utilities.

Basic example:
```ts
const policies = createCollection<Policy>(item => `policies_${item.id}`, createRandomPolicy);

/**
    Output:
    {
        "policies_0": policyItem0,
        "policies_1": policyItem1,
        ...
    }
*/
```

Example with overrides:

```ts
const policies = createCollection<Policy>(
    item => `policies_${item.id}`,
    index => ({ ...createRandomPolicy(index), isPinned: true })
);
```

## Mocking `node_modules`, user modules, and what belongs in `jest/setup.ts`

If you need to mock a library that exists in `node_modules` then add it to the `__mocks__` folder in the root of the project. More information about this [here](https://jestjs.io/docs/manual-mocks#mocking-node-modules). If you need to mock an individual library you should create a mock module in a `__mocks__` subdirectory adjacent to the library as explained [here](https://jestjs.io/docs/manual-mocks#mocking-user-modules). However, keep in mind that when you do this you also must manually require the mock by calling something like `jest.mock('../../src/libs/Log');` at the top of an individual test file. If every test in the app will need something to be mocked that's a good case for adding it to `jest/setup.ts`, but we should generally avoid adding user mocks or `node_modules` mocks to this file. Please use the `__mocks__` subdirectories wherever appropriate.

## Assertions

- There are a ton of [matchers](https://jestjs.io/docs/en/using-matchers) that `jest` offers for making assertions.
- When testing an [Action](https://github.com/Expensify/App#actions) it is often best to test that `Onyx` data matches our expectations after the action runs.
```javascript
expect(onyxData).toBe(expectedOnyxData);
```

## Documenting Tests

Comments are just as critical in tests as the tests themselves. They provide context behind why the test was written and what the expected behavior is supposed to be which will benefit the future generations of engineers looking at them. Think about it. When was the last time you saw a unit test and wondered why it was written that way and then you didn't want to touch it because you didn't know if changing the behavior of the test was appropriate or not? It was probably pretty recent :D

In order to give future engineers the best context for a unit test, follow this guide:

1. DO add three sections to every test:
  - "Given" - This introduces the initial condition of the test
  - "When" - Describes what action is being done and the thing that is being tested
  - "Then" - Describes what is expected to happen

2. DO explain **WHY** the test is doing what it is doing in every comment.
3. DO NOT explain **WHAT** the code is doing in comments. This information should be self-evident.

The format looks like this:

```
// BAD
// Given an account
{* code that sets initial condition *}

// When it is closed
{* code that does something *}

// Then the user is logged out
{* code that performs the assertion *}

// GOOD
// Given an account of a brand new user
{* code that sets initial condition *}

// When the account is closed by clicking on the close account button
{* code that does something *}

// Then the user should be logged out because their account is no longer active
{* code that performs the assertion *}
```

## When to Write a Test

Many of the UI features of our application should go through rigorous testing by you, your PR reviewer, and finally QA before deployment. However, the code is mature enough now that protecting code against regressions is the top priority.

**What's a "good reason" to write a test?**

- Any PR that fixes a bug
- When introducing a new feature, cover as much logic as possible by unit tests
- Anything that is difficult or impossible to run a manual tests on
	- e.g. a test to verify an outcome after an authentication token expires (which normally takes two hours)
- Areas of the code that are changing often, breaking often, and would benefit from the resiliency an automated test would provide
- Lower JS libraries that might have many downstream effects
	- e.g. our [`ExpensiMark`](https://github.com/Expensify/expensify-common/blob/07ff1c2a07dc122aa89e3cfd3263bb1958222233/lib/ExpensiMark.js#L10) markdown parser
- [Actions](https://github.com/Expensify/App#actions). It's important to verify that data is being saved as expected after one or more actions have finished doing their work.

## Debugging Tests

If you are using Visual Studio Code, it's easy to debug a test you are writing or attempting to fix one that is now failing as a result of your changes. To step through a test while it's running grab the [Jest plugin](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) and make sure your `launch.json` settings match this:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "name": "vscode-jest-tests",
            "request": "launch",
            "args": [
                "--runInBand"
            ],
            "cwd": "${workspaceFolder}",
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "disableOptimisticBPs": true,
            "program": "${workspaceFolder}/node_modules/jest/bin/jest"
        }
    ]
}
```
You should now be able to set breakpoints anywhere in the code and run your test from within Visual Studio Code.
