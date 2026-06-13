import {useContext, useEffect, useRef} from 'react';
import {useDialogLabelData} from '@components/DialogLabelContext';
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

const MAX_INITIAL_FOCUS_FRAMES = 5;

/*
 * Mobile-web counterpart to `useDialogContainerFocus` (RHP-only): focuses `ref` once after `didScreenTransitionEnd`.
 * Hover-capable devices gate on Tab (WCAG 2.4.7); touch-primary devices bypass.
 */
const useScreenInitialFocus: UseScreenInitialFocus = (ref) => {
    const status = useContext(ScreenWrapperStatusContext);
    const {isInsideDialog} = useDialogLabelData();
    const claimedRef = useRef(false);

    useEffect(() => {
        if (isInsideDialog) {
            return;
        }
        if (!status?.didScreenTransitionEnd) {
            claimedRef.current = false;
            return;
        }
        if (claimedRef.current) {
            return;
        }
        if (hasHoverSupport() && !getHadTabNavigation()) {
            return;
        }
        let rafId: number | null = null;
        let framesLeft = MAX_INITIAL_FOCUS_FRAMES;
        const attempt = () => {
            const el = ref.current;
            if (el && isOnScreen(el) && claimInitialFocus(el, {focusVisible: getHadTabNavigation()})) {
                claimedRef.current = true;
                return;
            }
            // The target can attach, or its ancestors settle so focus lands, a few frames after the transition ends.
            framesLeft -= 1;
            if (framesLeft <= 0) {
                return;
            }
            rafId = requestAnimationFrame(attempt);
        };
        attempt();
        return () => {
            if (rafId === null) {
                return;
            }
            cancelAnimationFrame(rafId);
        };
    }, [isInsideDialog, status?.didScreenTransitionEnd, ref]);
};

export default useScreenInitialFocus;
