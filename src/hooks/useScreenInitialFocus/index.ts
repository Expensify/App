import {useContext, useEffect, useRef} from 'react';
import {useDialogLabelData} from '@components/DialogLabelContext';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import Accessibility from '@libs/Accessibility';
import claimInitialFocus from '@libs/claimInitialFocus';
import hasHoverSupport from '@libs/DeviceCapabilities/hasHoverSupport';
import {MAX_INITIAL_FOCUS_FRAMES} from '@libs/focusReturnTimings';
import getHadTabNavigation from '@libs/hadTabNavigation';
import type UseScreenInitialFocus from './types';

/** Geometry guard for off-screen Pressables (Growls, pre-animation drawers) that pass attribute checks. */
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

/**
 * Mobile-web focus on `node` once after `didScreenTransitionEnd`. Takes a node (not a ref) so late attachment re-runs the effect.
 * Hover-capable devices gate on Tab (WCAG 2.4.7); touch-primary devices bypass.
 */
const useScreenInitialFocus: UseScreenInitialFocus = (node, options) => {
    const status = useContext(ScreenWrapperStatusContext);
    const {isInsideDialog} = useDialogLabelData();
    const claimedRef = useRef(false);
    const shouldSkip = options?.shouldSkip ?? false;
    const shouldClaimOnlyForScreenReader = options?.shouldClaimOnlyForScreenReader ?? false;

    useEffect(() => {
        if (shouldSkip || isInsideDialog) {
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
        if (shouldClaimOnlyForScreenReader && Accessibility.getScreenReaderState() === 'disabled') {
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
    }, [shouldSkip, shouldClaimOnlyForScreenReader, isInsideDialog, status?.didScreenTransitionEnd, node]);
};

export default useScreenInitialFocus;
