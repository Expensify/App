import {setPageTitle} from '@libs/UnreadIndicatorUpdater/updateUnread';

import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useRef} from 'react';

/**
 * Monotonically increasing token that identifies which screen currently "owns" the document title.
 * Each focus claims the latest token; a screen's cleanup only clears the title if no newer screen has
 * claimed ownership since. This keeps the reset race-safe: a late-firing cleanup from a blurred screen
 * can never wipe the title that a newly focused screen has just set (the flicker regression that led to
 * the cleanup being removed in https://github.com/Expensify/App/pull/85473), while a screen that
 * navigates to a title-less page (e.g. the Sign-In screen after logout) still resets the title back to
 * the default site title.
 */
let latestFocusToken = 0;

function useDocumentTitle(title: string) {
    const focusTokenRef = useRef(0);
    useFocusEffect(
        useCallback(() => {
            latestFocusToken += 1;
            focusTokenRef.current = latestFocusToken;
            setPageTitle(title);

            return () => {
                // Only clear the title if this screen is still the latest owner. If a newer screen has
                // claimed the title since we focused, its title must win and this cleanup is a no-op.
                if (focusTokenRef.current !== latestFocusToken) {
                    return;
                }
                setPageTitle('');
            };
        }, [title]),
    );
}

export default useDocumentTitle;
