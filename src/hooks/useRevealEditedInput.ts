/**
 * Reveals an already-focused input when editing resumes after scrolling it out of view.
 */
import CONST from '@src/CONST';

import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {useEffect, useRef} from 'react';

type UseRevealEditedInputOptions = {
    isEnabled: boolean;
    /** Starts scrolling immediately; keyboard-opening delays belong to the initial focus handler. */
    scrollTo: (offset: number) => void;
};

function useRevealEditedInput({isEnabled, scrollTo}: UseRevealEditedInputOptions) {
    const inputBoundsRef = useRef({top: 0, height: 0});
    const viewportRef = useRef({offset: 0, height: 0});
    const isFocusedRef = useRef(false);
    const frameRef = useRef<number | undefined>(undefined);
    const targetRef = useRef<{offset: number; expiresAt: number} | undefined>(undefined);

    const cancelRecovery = () => {
        if (frameRef.current !== undefined) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = undefined;
        }
        targetRef.current = undefined;
    };

    useEffect(() => cancelRecovery, [cancelRecovery, isEnabled]);

    const measureInput = ({nativeEvent}: LayoutChangeEvent) => {
        inputBoundsRef.current = {top: nativeEvent.layout.y, height: nativeEvent.layout.height};
    };

    const trackScroll = ({nativeEvent}: NativeSyntheticEvent<NativeScrollEvent>) => {
        viewportRef.current = {offset: nativeEvent.contentOffset.y, height: nativeEvent.layoutMeasurement.height};
        if (nativeEvent.contentOffset.y === targetRef.current?.offset) {
            targetRef.current = undefined;
        }
    };

    const markFocused = () => {
        isFocusedRef.current = true;
    };

    const markBlurred = () => {
        isFocusedRef.current = false;
        cancelRecovery();
    };

    const revealEditedInput = () => {
        if (!isEnabled || !isFocusedRef.current || frameRef.current !== undefined) {
            return;
        }
        // Wait for the edit's layout, and combine edits arriving in the same frame.
        frameRef.current = requestAnimationFrame(() => {
            // Cancellation also protects against callbacks already dispatched before cleanup.
            if (frameRef.current === undefined) {
                return;
            }
            frameRef.current = undefined;
            const {offset, height} = viewportRef.current;
            const input = inputBoundsRef.current;
            if (!isFocusedRef.current || height <= 0 || input.height <= 0) {
                return;
            }
            // The bounded multiline input scrolls its own text to the caret; reveal its box in the outer viewport.
            const inputBottom = input.top + Math.min(input.height, height);
            const targetOffset = Math.max(0, Math.min(input.top, Math.max(offset, inputBottom - height)));
            const pendingTarget = targetRef.current;
            if (targetOffset === offset || (targetOffset === pendingTarget?.offset && Date.now() < pendingTarget.expiresAt)) {
                return;
            }
            // Bound duplicate suppression because interrupted web scrolls do not always emit a drag event.
            // This window does not assume that the platform's smooth scroll finishes at a particular time.
            targetRef.current = {offset: targetOffset, expiresAt: Date.now() + CONST.ANIMATED_TRANSITION};
            scrollTo(targetOffset);
        });
    };

    return {measureInput, trackScroll, markFocused, markBlurred, revealEditedInput, cancelRecovery};
}

export default useRevealEditedInput;
