# Getting Started

##  What are UI Tests?

UI (User Interface) tests validate the visible and interactive parts of an application. They ensure that components render correctly, handle user interactions as expected, and provide a reliable user experience.

### Why are UI tests important?

- Catch regressions early: Ensure that existing functionality remains intact after changes.
- Validate that the application works as intended: Confirm that the app behaves as expected from the user’s perspective.
- Increase confidence when refactoring code: When you need to change or improve the codebase, tests help verify that changes don’t break existing features.
- Improve user experience: UI tests ensure that components interact properly, making your app more robust and user-friendly.

### Prerequisites

-  Familiarity with the React Native Testing Library [RNTL](https://callstack.github.io/react-native-testing-library/).
- Basic understanding of [Jest](https://jestjs.io/).

## Best practices

### When to Add UI Tests:

1. **User Interactions**:
- Why: When the component responds to user actions, it's essential to verify that the interactions are correctly handled.
- Example: Testing if a button calls its `onPress` handler correctly.

``` javascript
test('calls onPress when button is clicked', () => {
    render(<Button onPress={mockHandler} />);
    fireEvent.press(screen.getByText('Click Me'));
    expect(mockHandler).toHaveBeenCalled();
});
```
2. **Dynamic Behavior**:
- Components that change their state or appearance based on props or state require tests to ensure they adapt correctly.
- Example: A dropdown that expands when clicked.

``` javascript
test('expands dropdown when clicked', () => {
    render(<Dropdown label="Options" options={['Option 1', 'Option 2']} />);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();

    fireEvent.press(screen.getByText('Options'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
});
```

3. **Edge Cases**:
- It's crucial to test how your component behaves with invalid or unusual inputs to ensure stability and handle user errors gracefully
- Example: Testing an input field's behavior with empty or invalid values.

``` javascript
test('shows error message for invalid input', () => {
    render(<TextInputWithValidation />);

    const input = screen.getByPlaceholderText('Enter your email');
    fireEvent.changeText(input, 'invalid-email');

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
});
```

4. **Reusable UI Patterns**:
- Why: Components that are reused across the app need consistent behavior across different contexts.
- Example: Custom Checkbox or Dropdown components.


``` javascript
test('toggles state when clicked', () => {
    const mockOnChange = jest.fn();
    render(<Checkbox label="Accept Terms" onChange={mockOnChange} />);

    const checkbox = screen.getByText('Accept Terms');
    fireEvent.press(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith(true);

    fireEvent.press(checkbox);
    expect(mockOnChange).toHaveBeenCalledWith(false);
});
```
### When to Skip UI Tests for Components:

**Purely Presentational Components**:

- Why: These components don’t contain logic or interactivity, so testing them is often unnecessary. Focus on visual output and accessibility instead.
- Example: Avatar component that only displays an image, we generally don’t need tests unless there’s a specific behavior to verify.

### Do’s

- Write tests that reflect actual user behavior (e.g., clicking buttons, filling forms).
- Mock external dependencies like network calls or Onyx data.
- Use `findBy` and `waitFor` to handle asynchronous updates in the UI.
- Follow naming conventions for test IDs (`testID="component-name-action"`).
- Test for accessibility attributes like `accessibilityLabel`, `accessibilityHint`, etc., to improve test coverage for screen readers.
- Reuse test utilities: Write helper functions to handle repetitive test setup, reducing code duplication and improving maintainability.
- **Rather than targeting 100% coverage, prioritize meaningful tests for critical workflows and components**.

### Don’ts

- Don’t test implementation details (e.g., state variables or internal method calls).
- Don’t ignore warnings: Fix `act()` or other common warnings to ensure reliability.
- Avoid over-mocking: Mock dependencies sparingly to maintain realistic tests.
    - *Bad*: Mocking a child component unnecessarily.
    - *Good*: Mocking a network request while testing component interactions.
- Don’t hardcode timeouts: Use dynamic queries like `waitFor` instead.

###  When to Skip Tests

Contributors may skip tests in the following cases:
- Non-Functional Changes: E.g.,styling updates or refactors without behavioral changes.
- Temporary Fixes: If a test will be added in a follow-up task, document the reason in the PR.
- Legacy Code: For highly complex legacy components, prioritize fixing the issue over full test coverage.

**Note**: Always document skipped tests clearly in the PR description.


### Common Pitfalls
- Not awaiting async actions: Forgetting to await async actions can result in tests failing because components haven’t updated yet.

```javascript
// Correct usage
await waitFor(() => expect(screen.getByText('Success')).toBeInTheDocument());
```
- Testing too much or too little: Striking a balance is key. Too many trivial tests lead to bloated test suites, while too few leave untested areas that could break easily.

- Not cleaning up between tests: React components often leave behind side effects. Make sure to clean up between tests to ensure they are isolated and avoid conflicts.

``` javascript
afterEach(() => {
  jest.clearAllMocks();  // Clears mocks after each test
});
```

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

Tests aren't always clear about what exactly is being tested.  To make this a bit easier we recommend adopting the following format for code comments:

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
        Report.addComment(REPORT_ID, 'Hello!');
        return waitForBatchedUpdates()
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
