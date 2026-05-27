import {useContext, useEffect, useRef} from 'react';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import hasHoverSupport from '@libs/DeviceCapabilities/hasHoverSupport';
import getHadTabNavigation from '@libs/hadTabNavigation';
import {Priorities, tryClaim} from '@libs/ScreenFocusArbiter';
import type UseScreenInitialFocus from './types';

/*
 * Pressables transformed off-screen (Growl notifications, drawer items pre-animation) still pass
 * attribute checks; only geometry rules them out. Cheap inline test — no shared helper since this
 * is the only consumer.
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
 * Focuses the given element once per screen mount, after `didScreenTransitionEnd`. Used by
 * `HeaderWithBackButton` to land focus on the back button when a screen opens — covers narrow
 * mobile-web layouts (Chrome / Safari) where the RHP-only `useDialogContainerFocus` doesn't run.
 *
 * Hover-capable devices gate on Tab (WCAG 2.4.7 — mouse nav must not show focus rings);
 * touch-primary devices bypass since Tab is unavailable and screen-reader users need the back
 * button focused on mount.
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
