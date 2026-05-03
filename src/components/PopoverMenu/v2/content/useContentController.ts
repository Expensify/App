import type {Dispatch, SetStateAction} from 'react';
import type {ContentActions, ContentFocus, ContentNavigation} from './ContentContext';
import useFocusableRegistry from './useFocusableRegistry';
import useSubNavigation from './useSubNavigation';

/** Composes sub-navigation, focus registry, and atomic close. Returns slices for the three Content contexts. */
function useContentController({isVisible, setIsVisible}: {isVisible: boolean; setIsVisible: Dispatch<SetStateAction<boolean>>}): {
    navigation: ContentNavigation;
    focus: ContentFocus;
    actions: ContentActions;
} {
    const focus = useFocusableRegistry({isVisible});
    // Order matters: useFocusableRegistry first so its `resetFocus` exists for `onLevelChange`.
    const subNav = useSubNavigation({onLevelChange: focus.resetFocus});

    const actions: ContentActions = {
        ...subNav.actions,
        ...focus.actions,
        close: () => {
            // Batched into one render so the next open lands at root with no focused row.
            setIsVisible(false);
            subNav.resetToRoot();
            focus.resetFocus();
        },
    };

    return {
        navigation: {currentSubID: subNav.currentSubID, currentSubAncestorChain: subNav.currentSubAncestorChain},
        focus: {focusedID: focus.focusedID},
        actions,
    };
}

export default useContentController;
