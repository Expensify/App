// Sequencing delay for focus traps, autofocus, scroll-to-input, and other post-transition work.
// Kept at 300ms on web so callers using `setTimeout(..., ANIMATED_TRANSITION)` still wait for layout to settle,
// even though the menu/dropdown animation itself is now instant on web (see MENU_ANIMATION_DURATION).
const ANIMATED_TRANSITION = 300;
const MENU_ANIMATION_DURATION = 1;
const DEFAULT_IN = 1;
const DEFAULT_OUT = 1;
const DEFAULT_RIGHT_DOCKED_IOS_IN = 1;
const DEFAULT_RIGHT_DOCKED_IOS_OUT = 1;
const FAB_IN = 1;
const FAB_OUT = 1;

export {ANIMATED_TRANSITION, MENU_ANIMATION_DURATION, DEFAULT_IN, DEFAULT_OUT, DEFAULT_RIGHT_DOCKED_IOS_IN, DEFAULT_RIGHT_DOCKED_IOS_OUT, FAB_IN, FAB_OUT};
