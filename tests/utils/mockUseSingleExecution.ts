/**
 * Test-only replacement for `useSingleExecution` that calls the action synchronously and never
 * reports `isExecuting`. Use via:
 *
 *   jest.mock('@hooks/useSingleExecution', () =>
 *       jest.requireActual<typeof import('.../mockUseSingleExecution')>('.../mockUseSingleExecution'),
 *   );
 *
 * in tests that press a button and assert on the resulting side effect, but aren't testing the
 * double-tap-prevention mechanism itself. That mechanism relies on a real (non-fake) timer to
 * clear `isExecuting` (see CONST.TIMING.SINGLE_EXECUTION_DEBOUNCE_TIME), so it won't resolve
 * within a normal test's lifetime and would otherwise leave buttons stuck disabled.
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
