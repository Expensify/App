/**
 * Runs `navigate` on the next microtask instead of synchronously.
 *
 * A synchronous navigate from inside a touch/press handler unmounts the current screen and mounts the
 * next one while the same touch is still being dispatched, so on release the event can land on the new
 * screen (e.g. its back button) and pop the flow back. Deferring to a microtask lets the touch finish
 * first.
 *
 * Prefer this over a bare `Promise.resolve().then(...)` when navigating from a press/gesture handler.
 */
function deferNavigate(navigate: () => void) {
    Promise.resolve().then(navigate);
}

export default deferNavigate;
