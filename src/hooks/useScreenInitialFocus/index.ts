import {useContext, useEffect, useRef} from 'react';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import hasHoverSupport from '@libs/DeviceCapabilities/hasHoverSupport';
import getHadTabNavigation from '@libs/hadTabNavigation';
import {Priorities, tryClaim} from '@libs/ScreenFocusArbiter';
import type UseScreenInitialFocus from './types';

/*
 * Off-screen Pressables (Growls, pre-animation drawers) pass attribute checks; geometry rules them out.
 */
function isOnScreen(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        return false;
    }
    if (rect.bottom <= 0 || rect.right <= 0) {
        return false;
    }
    if (rect.top >= window.innerHeight || rect.left >= window.innerWidth) {
        return false;
    }
    return true;
}

/*
 * Focuses `ref` once after `didScreenTransitionEnd` — mobile-web counterpart to the RHP-only
 * `useDialogContainerFocus`. Hover-capable devices gate on Tab (WCAG 2.4.7 — mouse nav must not
 * show focus rings); touch-primary devices bypass.
 */
const useScreenInitialFocus: UseScreenInitialFocus = (ref) => {
    const status = useContext(ScreenWrapperStatusContext);
    const claimedRef = useRef(false);

    useEffect(() => {
        if (!status?.didScreenTransitionEnd || claimedRef.current) {
            return;
        }
        if (hasHoverSupport() && !getHadTabNavigation()) {
            return;
        }
        if (document.activeElement && document.activeElement !== document.body) {
            return;
        }
        const el = ref.current;
        if (!el || !isOnScreen(el)) {
            return;
        }
        if (!tryClaim(Priorities.INITIAL)) {
            return;
        }
        claimedRef.current = true;
        el.focus({preventScroll: true, focusVisible: true});
    }, [status?.didScreenTransitionEnd, ref]);
};

export default useScreenInitialFocus;
