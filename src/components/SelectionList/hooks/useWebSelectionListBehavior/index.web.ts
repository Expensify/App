import {useEffect, useState} from 'react';
import {isMobileChrome} from '@libs/Browser';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import type {UseWebSelectionListBehaviorOptions, UseWebSelectionListBehaviorResult} from './types';

/**
 * Custom hook that handles common web-specific behaviors for SelectionList components:
 * - Touch screen detection for keyboard dismissal
 * - Keyboard navigation scroll debouncing
 * - Optional hover style tracking for mouse interactions
 */
function useWebSelectionListBehavior({shouldTrackHoverStyle = false}: UseWebSelectionListBehaviorOptions = {}): UseWebSelectionListBehaviorResult {
    const [isScreenTouched, setIsScreenTouched] = useState(false);
    const [shouldDebounceScrolling, setShouldDebounceScrolling] = useState(false);
    const [shouldDisableHoverStyle, setShouldDisableHoverStyle] = useState(false);

    // Touch screen detection for mWeb - used to determine if keyboard should be dismissed
    useEffect(() => {
        if (!canUseTouchScreen()) {
            return;
        }

        const touchStart = () => setIsScreenTouched(true);
        const touchEnd = () => setIsScreenTouched(false);

        // We're setting `isScreenTouched` in this listener only for web platforms with touchscreen (mWeb) where
        // we want to dismiss the keyboard only when the list is scrolled by the user and not when it's scrolled programmatically.
        document.addEventListener('touchstart', touchStart);
        document.addEventListener('touchend', touchEnd);

        return () => {
            document.removeEventListener('touchstart', touchStart);
            document.removeEventListener('touchend', touchEnd);
        };
    }, []);

    // Keyboard scroll debouncing - prevents jittering when navigating with arrow keys
    useEffect(() => {
        const handleKeyboardScrollDebounce = (event: KeyboardEvent) => {
            if (!event) {
                return;
            }
            // Moving through items using the keyboard triggers scrolling by the browser, so we debounce programmatic scrolling to prevent jittering.
            if (
                event.key === CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN.shortcutKey ||
                event.key === CONST.KEYBOARD_SHORTCUTS.ARROW_UP.shortcutKey ||
                event.key === CONST.KEYBOARD_SHORTCUTS.TAB.shortcutKey
            ) {
                setShouldDebounceScrolling(event.type === 'keydown');
            }
        };

        document.addEventListener('keydown', handleKeyboardScrollDebounce, {passive: true});
        document.addEventListener('keyup', handleKeyboardScrollDebounce, {passive: true});

        return () => {
            document.removeEventListener('keydown', handleKeyboardScrollDebounce);
            document.removeEventListener('keyup', handleKeyboardScrollDebounce);
        };
    }, []);

    // Hover style tracking - re-enables hover when mouse moves (only for flat SelectionList)
    useEffect(() => {
        if (!shouldTrackHoverStyle || canUseTouchScreen()) {
            return;
        }

        let lastClientX = 0;
        let lastClientY = 0;

        const mouseMoveHandler = (event: MouseEvent) => {
            // On Safari, scrolling can also trigger a mousemove event,
            // so this comparison is needed to filter out cases where the mouse hasn't actually moved.
            if (event.clientX === lastClientX && event.clientY === lastClientY) {
                return;
            }

            lastClientX = event.clientX;
            lastClientY = event.clientY;

            setShouldDisableHoverStyle(false);
        };

        const wheelHandler = () => setShouldDisableHoverStyle(false);

        document.addEventListener('mousemove', mouseMoveHandler, {passive: true});
        document.addEventListener('wheel', wheelHandler, {passive: true});

        return () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('wheel', wheelHandler);
        };
    }, [shouldTrackHoverStyle]);

    return {
        shouldIgnoreFocus: isMobileChrome() && isScreenTouched,
        shouldDebounceScrolling,
        shouldDisableHoverStyle,
        setShouldDisableHoverStyle,
    };
}

export default useWebSelectionListBehavior;
