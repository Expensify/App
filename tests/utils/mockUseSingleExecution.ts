/**
 * Test-only replacement for `useSingleExecution` that calls the action synchronously and never
 * reports `isExecuting`. Applied globally for all tests in `jest/setupAfterEnv.ts`, so no test
 * needs to mock it individually.
 *
 * The real hook relies on real navigation transitions, via `runAfterPredictedTransition`/
 * `TransitionTracker`, to clear `isExecuting`. Those don't happen in unit tests and would
 * otherwise leave buttons stuck disabled - and pull in the navigation listener machinery just
 * because a test renders a Pressable-based component (Button, MenuItem, etc.).
 */
function useSingleExecution() {
    return {
        isExecuting: false,
        singleExecution:
            <T extends unknown[]>(action?: (...params: T) => void | Promise<void>) =>
            (...params: T) =>
                action?.(...params),
    };
}

export default useSingleExecution;
