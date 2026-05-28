import {useContext, useEffect, useRef} from 'react';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import claimInitialFocus from '@libs/claimInitialFocus';
import hasHoverSupport from '@libs/DeviceCapabilities/hasHoverSupport';
import getHadTabNavigation from '@libs/hadTabNavigation';
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
 * Mobile-web counterpart to `useDialogContainerFocus` (RHP-only): focuses `ref` once after `didScreenTransitionEnd`.
 * Hover-capable devices gate on Tab (WCAG 2.4.7); touch-primary devices bypass.
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
        let rafId: number | null = null;
        const attempt = (retry: boolean) => {
            const el = ref.current;
            if (!el || !isOnScreen(el)) {
                // The target can attach a frame after the transition ends; retry once on the next frame.
                if (retry) {
                    rafId = requestAnimationFrame(() => attempt(false));
                }
                return;
            }
            if (claimInitialFocus(el, {focusVisible: getHadTabNavigation()})) {
                claimedRef.current = true;
            }
        };
        attempt(true);
        return () => {
            if (rafId === null) {
                return;
            }
            cancelAnimationFrame(rafId);
        };
    }, [status?.didScreenTransitionEnd, ref]);
};

export default useScreenInitialFocus;
