import {useContext, useLayoutEffect} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

// This mutable ref holds the currently focused item's ref.
// It enables external actions like calling .focus() from outside this hook,
// as demonstrated in this PR: https://github.com/Expensify/App/pull/59206
// eslint-disable-next-line import/no-mutable-exports
let focusedItemRef: View | HTMLElement | null;

/**
 * Custom React hook created to handle sync of focus on an element when the user navigates through the app with keyboard.
 * When the user navigates through the app using the arrows and then the tab button, the focus on the element and the native focus of the browser differs.
 * To maintain consistency when an element is focused in the app, the focus() method is additionally called on the focused element to eliminate the difference between native browser focus and application focus.
 */
const useSyncFocusImplementation = (ref: RefObject<View | HTMLElement | null>, isFocused: boolean, shouldSyncFocus = true) => {
    // this hook can be used outside ScreenWrapperStatusContext (eg. in Popovers). So we to check if the context is present.
    // If we are outside context we don't have to look at transition status
    const contextValue = useContext(ScreenWrapperStatusContext);

    const didScreenTransitionEnd = contextValue ? contextValue.didScreenTransitionEnd : true;

    useLayoutEffect(() => {
        if (isFocused) {
            focusedItemRef = ref.current;
        }

        if (!isFocused || !shouldSyncFocus || !didScreenTransitionEnd) {
            return;
        }

        ref.current?.focus({preventScroll: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [didScreenTransitionEnd, isFocused, ref]);
};

export default useSyncFocusImplementation;
export {focusedItemRef};
