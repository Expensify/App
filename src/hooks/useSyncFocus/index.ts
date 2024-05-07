import {useLayoutEffect} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';

/**
 * Custom React hook created to handle sync of focus on an element when the user navigates through the app with keyboard.
 * When the user navigates through the app using the arrows and then the tab button, the focus on the element and the native focus of the browser differs.
 * To maintain consistency when an element is focused in the app, the focus() method is additionally called on the focused element to eliminate the difference between native browser focus and application focus.
 */
const useSyncFocus = (ref: RefObject<View>, isFocused: boolean, shouldSyncFocus = true) => {
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();

    useLayoutEffect(() => {
        if (!isFocused || !shouldSyncFocus || !didScreenTransitionEnd) {
            return;
        }

        ref.current?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [didScreenTransitionEnd, isFocused, ref]);
};

export default useSyncFocus;
