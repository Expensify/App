const FOCUS_MOVING_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Escape']);

/**
 * True when a keydown moves keyboard focus context — invalidates a stale activation latch.
 * Standalone modifiers / typing must NOT count (reintroduces the autofocus-poisoning race for muscle-memory Shift/Cmd after Enter).
 */
function isFocusMovingKeydown(e: KeyboardEvent): boolean {
    return FOCUS_MOVING_KEYS.has(e.key);
}

export default isFocusMovingKeydown;
