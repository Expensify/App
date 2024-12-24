# Getting Started

##  What are UI Tests?

UI (User Interface) tests validate the visible and interactive parts of an application. They ensure that components render correctly, handle user interactions as expected, and provide a reliable user experience.

### Prerequisites

- Familiarity with the React Native Testing Library [RNTL](https://callstack.github.io/react-native-testing-library/).
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
- Mock external dependencies like network calls or Onyx data. If the amount of onyx data is large, place it in an external JSON file with the same name as the test file and import the data.
- Use `findBy` and `waitFor` to handle asynchronous updates in the UI.
- Follow naming conventions for test IDs (`testID="component-name-action"`).
- Test for accessibility attributes like `accessibilityLabel`, `accessibilityHint`, etc., to improve test coverage for screen readers.  These  attributes are vital for users who rely on assistive technologies like screen readers. Testing them ensures that app is inclusive and usable for all.

``` javascript
    test('component has correct role', () => {
        render(<Button accessibilityLabel="Submit" />)
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
```
- Reuse test utilities: Write helper functions to handle repetitive test setup, reducing code duplication and improving maintainability.
- **Rather than targeting 100% coverage, prioritize meaningful tests for critical workflows and components**.

### Don’ts

- Don’t test implementation details (e.g., state variables or internal method calls).
- Don’t ignore warnings: Fix `act()` or other common warnings to ensure reliability. The `act()` function ensures that any updates to the state or props of a component (including rendering, firing events, or manual state updates) are completed before the test proceeds. The RNTL automatically wraps most rendering and interaction utilities (`render`, `fireEvent`, `waitFor`, etc.) in `act()` to manage these updates. However, there are some situations where manual use of `act()` might be necessary, particularly when dealing with asynchronous logic, animations or timers (`setTimeout`, `setInterval` etc). You can find more detailed explanation [here](https://callstack.github.io/react-native-testing-library/docs/advanced/understanding-act).
- Avoid over-mocking: Mock dependencies sparingly to maintain realistic tests.
    - *Bad*: Mocking a child component unnecessarily.
    - *Good*: Mocking a network request while testing component interactions.
- Don’t hardcode timeouts: Use dynamic queries like `waitFor` instead.

###  When to Skip Tests

Contributors may skip tests in the following cases:
- Non-Functional Changes: E.g styling updates, github workflow changes, translation updates or refactors without behavioral changes.
- Temporary Fixes: If a test will be added in a follow-up task, document the reason in the PR.

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
- Having tightly coupled tests where one test depends on the actions from a previous test. This can cause tests to fail unexpectedly and it makes tests hard to maintain and debug. Each test should be self-sufficient.
