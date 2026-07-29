const FOCUS_MOVING_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Escape']);

/**
 * True when a keydown moves keyboard focus context. Used to invalidate a stale activation latch — a user who has moved on no longer intends the prior Enter/Space target as the trigger.
 * Standalone modifiers / typing must NOT be counted (that reintroduces the autofocus-poisoning race for muscle-memory Shift/Cmd after Enter).
 */
function isFocusMovingKeydown(e: KeyboardEvent): boolean {
    return FOCUS_MOVING_KEYS.has(e.key);
}

export default isFocusMovingKeydown;
