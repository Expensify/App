import type {OnTabTransitionEnd} from './types';

// Ends the tab-switch transition once the slide animation finishes.
// Native signals "finished" via `swipeEnd` (PagerView idle, for swipes and taps alike), so ignore everything else.
const onTabTransitionEnd: OnTabTransitionEnd = (source, endTransition) => {
    if (source !== 'swipeEnd') {
        return;
    }
    endTransition();
};

export default onTabTransitionEnd;
