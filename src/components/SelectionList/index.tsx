import React, {useEffect, useState} from 'react';
import {isMobileChrome} from '@libs/Browser';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import BaseSelectionList from './BaseSelectionList';
import type {ListItem} from './ListItem/types';
import type {SelectionListProps} from './types';

function SelectionList<TItem extends ListItem>({ref, ...props}: SelectionListProps<TItem>) {
    const [isScreenTouched, setIsScreenTouched] = useState(false);
    const [shouldDebounceScrolling, setShouldDebounceScrolling] = useState(false);
    const [shouldDisableHoverStyle, setShouldDisableHoverStyle] = useState(false);

    const touchStart = () => setIsScreenTouched(true);
    const touchEnd = () => setIsScreenTouched(false);

    useEffect(() => {
        if (!canUseTouchScreen()) {
            return;
        }
        // We're setting `isScreenTouched` in this listener only for web platforms with touchscreen (mWeb) where
        // we want to dismiss the keyboard only when the list is scrolled by the user and not when it's scrolled programmatically.
        document.addEventListener('touchstart', touchStart);
        document.addEventListener('touchend', touchEnd);

        return () => {
            document.removeEventListener('touchstart', touchStart);
            document.removeEventListener('touchend', touchEnd);
        };
    }, []);

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

    useEffect(() => {
        document.addEventListener('keydown', handleKeyboardScrollDebounce, {passive: true});
        document.addEventListener('keyup', handleKeyboardScrollDebounce, {passive: true});

        return () => {
            document.removeEventListener('keydown', handleKeyboardScrollDebounce);
            document.removeEventListener('keyup', handleKeyboardScrollDebounce);
        };
    }, []);

    useEffect(() => {
        if (canUseTouchScreen()) {
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
    }, []);

    return (
        <BaseSelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            // Ignore the focus if it's caused by a touch event on mobile chrome.
            // For example, a long press will trigger a focus event on mobile chrome.
            shouldIgnoreFocus={isMobileChrome() && isScreenTouched}
            shouldDebounceScrolling={shouldDebounceScrolling}
            shouldDisableHoverStyle={shouldDisableHoverStyle}
            setShouldDisableHoverStyle={setShouldDisableHoverStyle}
        />
    );
}

SelectionList.displayName = 'SelectionList';

export default SelectionList;
