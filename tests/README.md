# Tips on Writing Automated Tests in Jest

[Jest](https://jestjs.io/) is a testing framework we use to ensure our most mission critical libraries are as stable as possible. Here are a few things to consider with regards to our app's architecture when testing in Jest.

## Asynchronous Testing

- Much of the logic in the app is asynchronous in nature. [`react-native-onyx`](https://github.com/expensify/react-native-onyx) relies on [`AsyncStorage`](https://github.com/react-native-async-storage/async-storage) and writes data async before updating subscribers.
- [Actions](https://github.com/Expensify/App#actions) do not typically return a `Promise` and therefore can't always be "awaited" before running an assertion.
- To test a result after some asynchronous code has run we can use [`Onyx.connect()`](https://github.com/Expensify/react-native-onyx/blob/2c94a94e51fab20330f7bd5381b72ea6c25553d9/lib/Onyx.js#L217-L231) and the helper method [`waitForPromisesToResolve()`](https://github.com/Expensify/ReactNativeChat/blob/ca2fa88a5789b82463d35eddc3d57f70a7286868/tests/utils/waitForPromisesToResolve.js#L1-L9) which returns a `Promise` and will ensure that all other `Promises` have finished running before resolving.
- **Important Note:** When writing any asynchronous Jest test it's very important that your test itself **return a `Promise`**.

## Mocking Network Requests

- Network requests called in tests do not run against any test database so we must [mock them](https://jestjs.io/docs/en/mock-functions) with a `jest.fn()`.
- To simulate a network request succeeding or failing we can mock the expected response first and then manually trigger the action that calls that API command.
- [Mocking the response of `HttpUtils.xhr()`](https://github.com/Expensify/App/blob/ca2fa88a5789b82463d35eddc3d57f70a7286868/tests/actions/SessionTest.js#L25-L32) is the best way to simulate various API conditions so we can verify whether a result occurs or not.

## Assertions

- There are a ton of [matchers](https://jestjs.io/docs/en/using-matchers) that `jest` offers for making assertions.
- When testing an [Action](https://github.com/Expensify/App#actions) it is often best to test that `Onyx` data matches our expectations after the action runs.
```javascript
expect(onyxData).toBe(expectedOnyxData);
```

## Documenting Tests

Tests aren't always clear about what exactly is being tested. To make this a bit easier we recommend adopting the following format for code comments:

```
// Given <initial_condition>
...  code that sets initial condition

// When <something_happens>
... code that does something

// Then <expectation>
... code that performs the assertion
```

## Example Test

```javascript
HttpUtils.xhr = jest.fn();

describe('actions/Report', () => {
    it('adds an optimistic comment', () => {
        // Given an Onyx subscription to a report's `reportActions`
        const ACTION_ID = 1;
        const REPORT_ID = 1;
        let reportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: val => reportActions = val,
        });

        // Mock Report_AddComment command so it can succeed
        HttpUtils.xhr.mockImplementation(() => Promise.resolve({
            jsonCode: 200,
        }));

        // When we add a new action to that report
        Report.createComment(REPORT_ID, 'Hello!');
        return waitForPromisesToResolve()
            .then(() => {
                const action = reportActions[ACTION_ID];

                // Then the action set in the Onyx callback should match
                // the comment we left and it will be in a loading state because
                // it's an "optimistic comment"
                expect(action.message[0].text).toBe('Hello!');
                expect(action.isPending).toBe(true);
            });
    });
});
```

## When to Write a Test

Many of the UI features of our application should go through rigorous testing by you, your PR reviewer, and finally QA before deployment. It's also difficult to maintain UI tests when the UI changes often. Therefore, it's not valuable for us to place every single part of the application UI under test at this time. The manual testing steps should catch most major UI bugs. Therefore, if we are writing any test there should be a **good reason**.

**What's a "good reason" to write a test?**

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
