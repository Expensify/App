/**
 * iOS Safari resets the page scroll on rotation and doesn't bring the focused input back above the keyboard, so this
 * scrolls the page to reveal it. It acts on the page's focused input, so it's used once at the app root.
 */
import {isMobileWebKit} from '@libs/Browser';
import isEditableElement from '@libs/isEditableElement';
import isInLandscapeMode from '@libs/isInLandscapeMode';
import addViewportResizeListener from '@libs/VisualViewport';

import {useEffect} from 'react';

function revealFocusedInput() {
    const focusedElement = document.activeElement;
    const viewport = window.visualViewport;
    // With no visible area, like under the landscape emoji keyboard, scrolling only fights Safari's viewport resizing
    if (!viewport || viewport.height <= 0 || !isEditableElement(focusedElement)) {
        return;
    }

    const {top, bottom} = focusedElement.getBoundingClientRect();
    const visibleTop = viewport.offsetTop;
    const visibleBottom = viewport.offsetTop + viewport.height;
    // When the visible area is shorter than the input, keep its start in view, as Safari does on focus
    const shouldAlignTop = top < visibleTop || bottom - top > viewport.height;
    const scrollDistance = shouldAlignTop ? top - visibleTop : Math.max(bottom - visibleBottom, 0);
    if (Math.abs(scrollDistance) < 1) {
        return;
    }
    window.scrollBy(0, scrollDistance);
}

function useRevealFocusedInputAfterRotation() {
    useEffect(() => {
        if (!isMobileWebKit()) {
            return;
        }

        // Orientation comes from the width, because the keyboard also resizes the window but doesn't change its width
        let wasInLandscapeMode = isInLandscapeMode(window.innerWidth);
        let isRotatedWithInputFocused = false;
        let revealFrameID: number | undefined;

        const trackRotation = () => {
            const isNowInLandscapeMode = isInLandscapeMode(window.innerWidth);
            if (isNowInLandscapeMode === wasInLandscapeMode) {
                return;
            }
            wasInLandscapeMode = isNowInLandscapeMode;
            isRotatedWithInputFocused = isEditableElement(document.activeElement);
        };

        const stopRevealingFocusedInput = () => {
            isRotatedWithInputFocused = false;
        };

        const cancelPendingReveal = () => {
            if (revealFrameID === undefined) {
                return;
            }
            cancelAnimationFrame(revealFrameID);
            revealFrameID = undefined;
        };

        // The viewport resizes several times after a rotation, so the input is checked on each one until it loses focus
        const revealFocusedInputAfterRotation = () => {
            if (!isRotatedWithInputFocused) {
                return;
            }
            cancelPendingReveal();
            revealFrameID = requestAnimationFrame(() => {
                revealFrameID = undefined;
                revealFocusedInput();
            });
        };

        window.addEventListener('resize', trackRotation);
        document.addEventListener('focusout', stopRevealingFocusedInput);
        const removeViewportResizeListener = addViewportResizeListener(revealFocusedInputAfterRotation);

        return () => {
            window.removeEventListener('resize', trackRotation);
            document.removeEventListener('focusout', stopRevealingFocusedInput);
            removeViewportResizeListener();
            cancelPendingReveal();
        };
    }, []);
}

export default useRevealFocusedInputAfterRotation;
