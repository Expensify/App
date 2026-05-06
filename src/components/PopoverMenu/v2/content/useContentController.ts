import type {Dispatch, SetStateAction} from 'react';
import type {ContentClose, ContentFocus, ContentItemActions, ContentNavigation, ContentSubActions} from './ContentContext';
import useFocusableRegistry from './useFocusableRegistry';
import useSubNavigation from './useSubNavigation';

function useContentController({isVisible, setIsVisible}: {isVisible: boolean; setIsVisible: Dispatch<SetStateAction<boolean>>}): {
    navigation: ContentNavigation;
    focus: ContentFocus;
    subActions: ContentSubActions;
    itemActions: ContentItemActions;
    close: ContentClose;
} {
    const focus = useFocusableRegistry({isVisible});
    // Order matters: useFocusableRegistry first so its `resetFocus` exists for `onLevelChange`.
    const subNav = useSubNavigation({onLevelChange: focus.resetFocus});

    // Batched into one render so the next open lands at root with no focused row.
    const close: ContentClose = () => {
        setIsVisible(false);
        subNav.resetToRoot();
        focus.resetFocus();
    };

    return {
        navigation: {currentSubID: subNav.currentSubID, isAncestorOfCurrent: subNav.isAncestorOfCurrent},
        focus: {focusedID: focus.focusedID},
        subActions: subNav.actions,
        itemActions: focus.actions,
        close,
    };
}

export default useContentController;
