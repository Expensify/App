/** Which settle event fired for a tap/programmatic tab switch. Web settles on `tabSelect`, native on `swipeEnd`. */
type TabTransitionSettleSource = 'swipeEnd' | 'tabSelect';

/**
 * Ends an in-flight tab-switch transition, but only for the settle event that is authoritative on the current platform.
 * Encapsulates the platform difference so callers wire both events without branching on `Platform.OS`.
 */
type OnTabTransitionEnd = (source: TabTransitionSettleSource, endTransition: () => void) => void;

export type {TabTransitionSettleSource, OnTabTransitionEnd};
