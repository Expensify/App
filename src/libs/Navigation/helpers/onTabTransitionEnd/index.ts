import type {OnTabTransitionEnd} from './types';

// Ends the tab-switch transition once the slide animation finishes.
// Web signals "finished" via `tabSelect` (never `swipeEnd`), so ignore everything else.
const onTabTransitionEnd: OnTabTransitionEnd = (source, endTransition) => {
    if (source !== 'tabSelect') {
        return;
    }
    endTransition();
};

export default onTabTransitionEnd;
