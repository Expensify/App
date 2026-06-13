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
 * Mobile-web counterpart to `useDialogContainerFocus` (RHP-only): focuses `node` once after `didScreenTransitionEnd`.
 * Takes the attached node (not a ref) so late attachment — skeleton → real header, Suspense — re-runs the effect.
 * Hover-capable devices gate on Tab (WCAG 2.4.7); touch-primary devices bypass.
 */
const useScreenInitialFocus: UseScreenInitialFocus = (node) => {
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
        if (!node) {
            return;
        }
        if (hasHoverSupport() && !getHadTabNavigation()) {
            return;
        }
        let rafId: number | null = null;
        let framesLeft = MAX_INITIAL_FOCUS_FRAMES;
        const attempt = () => {
            if (isOnScreen(node) && claimInitialFocus(node, {focusVisible: getHadTabNavigation()})) {
                claimedRef.current = true;
                return;
            }
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
    }, [isInsideDialog, status?.didScreenTransitionEnd, node]);
};

export default useScreenInitialFocus;
