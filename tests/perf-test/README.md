# Performance testing

We use Reassure for monitoring performance regression. It helps us check if our app is getting faster and quickly spot any issues we need to fix.

## How does Reassure work?

- Reassure builds on the existing React Testing Library setup and adds a performance measurement functionality. It's intended to be used on local machine and on a remote server as part of your continuous integration setup.
- To make sure the results are reliable and consistent, Reassure runs tests twice – once for the current branch and once for the base branch.

## Performance Testing Strategy (`measurePerformance`)

- The primary focus is on testing business cases rather than small, reusable parts that typically don't introduce regressions, although some tests in that area are still necessary.
- To achieve this goal, it's recommended to stay relatively high up in the React tree, targeting whole screens to recreate real-life scenarios that users may encounter.
- For example, consider scenarios where an additional `useMemo` call could impact performance negatively.
- Please note that high-complexity components, such as `ReportScreen` for example, may have many external dependencies (as well as their child components), which may cause tests to be flaky. Therefore, it is not recommended to add detailed tests to these types of components. Instead, add a test for those lower in the React tree (e.g. `Composer`).
- Make sure all additional dependencies are mocked correctly (navigation, contexts, external libraries, API etc.).

## `measureFunction` API approach

- Identifying functions with heavy calculations.
- Targeting functions that are frequently used throughout the app.

## Running tests locally 

- Checkout your base environment, eg. `git checkout main`.
- Collect baseline metrics with `npx reassure --baseline`.
- Apply any desired changes (for testing purposes you can eg. try to slow down a list).
- Collect current metrics with `npx reassure`.
- Open up the resulting `output.md` / `output.json` (see console output) to compare the results.
- With all that information, Reassure can present the render duration times as statistically significant or meaningless.

## Metrics for Regression Detection

- **Render count**: If the number of renders increases by one compared to the baseline, it will be considered a performance regression, leading to a failed test. This metric helps detect unexpected changes in component rendering behavior. *NOTE: sometimes regressions are intentional. For instance, if a new functionality is added to the tested component, causing an additional re-render, this regression is expected.*
- **Render duration**: A performance regression will occur if the measured rendering time is 20% higher than the baseline, resulting in a failed test. This threshold allows for reasonable fluctuations and accounts for changes that may lead to longer rendering times.

## Tips for Performance Testing with Reassure

- Before you start using Reassure, take a bit of time to learn what it does [docs](https://callstack.github.io/reassure/).
- Mocking could initially be challenging, but preparing utilities for handling collections of data simplified the process. We’ve already prepared base for utilities for mocking collections. More information and instructions can be found [here](https://github.com/Expensify/App/tree/main/tests#mocking-collections--collection-items). *Feel free to adjust/ add more helper methods if you think it’s needed*.
- Mocking is a crucial part of performance testing. To achieve more accurate and meaningful results, mock and use as much data as possible.
- Inside each test, there is a defined scenario function that represents the specific user interaction you want to measure (HINT: there is no need to add assertions in performance tests).
- More runs generally lead to better and more reliable results by averaging out variations. Additionally, consider adjusting the number of runs per series for each specific test to achieve more granular insights.
- There's no need to mock Onyx before every test that uses `measureFunction()` because it doesn't need to be reset between each test case and we can just configure it once before running the tests.

## Why reassure test may fail:

- **Wrong mocking**:

    - Double-check and ensure that the mocks are accurate and aligned with the expected behavior.
    - Review the test cases and adjust the mocking accordingly.
- **Timeouts**:

    - The performance test takes much longer than regular tests. This is because we run each test scenario multiple times (10 by default) and repeat this for two branches of code.
    - This may lead to timeouts, especially if the Onyx mockup has extensive data.
    - Be mindful of the number of test runs. While repetition is essential, find the optimal balance to avoid unnecessarily extended test durations.
- **Render count error**:

    -  If the number of renders increases, the test on CI will fail with the following error:

		```Render count difference exceeded the allowed deviation of  0. Current difference: 1```

    - Investigate the code changes that might be causing this and address them to maintain a stable render count. More info [here](https://github.com/Expensify/App/blob/fe9e9e3e31bae27c2398678aa632e808af2690b5/tests/perf-test/README.md?plain=1#L32).
    - It is important to run Reassure tests locally and see if our changes caused a regression.
    - One of the potential factors that may influence variation in the number of renders is adding unnecesary providers to the component we want to test using ```<ComposeProviders>``` . Ensure that all providers are necessary for running the test.

## What can be tested (scenarios)

- Rendering lists with multiple items (try adding as much data as possible to get a more reliable result when it comes to potential regressions).
- Scrolling performance.
- onPress/onSelect action.
- Text input interactions.

## Example Test

```javascript
test('Count increments on press', async () => {
  const scenario = async (screen) => {
    const button = screen.getByText('Action');

    await screen.findByText('Count: 0');
    fireEvent.press(button);
    fireEvent.press(button);
    await screen.findByText('Count: 2');
  };

  await measurePerformance(
    <Counter />,
    { scenario, runs: 20 }
  );
});
```
