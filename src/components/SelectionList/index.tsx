import React, {forwardRef, useEffect, useState} from 'react';
import type {ForwardedRef} from 'react';
import {Keyboard} from 'react-native';
import * as Browser from '@libs/Browser';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CONST from '@src/CONST';
import BaseSelectionList from './BaseSelectionList';
import type {BaseSelectionListProps, ListItem, SelectionListHandle} from './types';

function SelectionList<TItem extends ListItem>({onScroll, ...props}: BaseSelectionListProps<TItem>, ref: ForwardedRef<SelectionListHandle>) {
    const [isScreenTouched, setIsScreenTouched] = useState(false);

    const touchStart = () => setIsScreenTouched(true);
    const touchEnd = () => setIsScreenTouched(false);

    useEffect(() => {
        if (!DeviceCapabilities.canUseTouchScreen()) {
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

    const [shouldDebounceScrolling, setShouldDebounceScrolling] = useState(false);

    const checkShouldDebounceScrolling = (event: KeyboardEvent) => {
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
        document.addEventListener('keydown', checkShouldDebounceScrolling, {passive: true});
        document.addEventListener('keyup', checkShouldDebounceScrolling, {passive: true});

        return () => {
            document.removeEventListener('keydown', checkShouldDebounceScrolling);
            document.removeEventListener('keyup', checkShouldDebounceScrolling);
        };
    }, []);

    // In SearchPageBottomTab we use useAnimatedScrollHandler from reanimated(for performance reasons) and it returns object instead of function. In that case we cannot change it to a function call, that's why we have to choose between onScroll and defaultOnScroll.
    const defaultOnScroll = () => {
        // Only dismiss the keyboard whenever the user scrolls the screen
        if (!isScreenTouched) {
            return;
        }
        Keyboard.dismiss();
    };

    return (
        <BaseSelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScroll={onScroll ?? defaultOnScroll}
            // Ignore the focus if it's caused by a touch event on mobile chrome.
            // For example, a long press will trigger a focus event on mobile chrome.
            shouldIgnoreFocus={Browser.isMobileChrome() && isScreenTouched}
            shouldDebounceScrolling={shouldDebounceScrolling}
        />
    );
}

SelectionList.displayName = 'SelectionList';

export default forwardRef(SelectionList);
