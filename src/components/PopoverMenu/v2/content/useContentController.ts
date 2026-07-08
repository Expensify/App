import {useRootActions, useRootVisibility} from '@components/PopoverMenu/v2/root/RootContext';

import type {ContentClose, ContentFocus, ContentItemActions, ContentNavigation, ContentSubActions} from './ContentContext';

import useCloseOnModalCover from './useCloseOnModalCover';
import useCloseOnScreenBlur from './useCloseOnScreenBlur';
import useFocusableRegistry from './useFocusableRegistry';
import useSubNavigation from './useSubNavigation';

function useContentController(componentName: string): {
    navigation: ContentNavigation;
    focus: ContentFocus;
    subActions: ContentSubActions;
    itemActions: ContentItemActions;
    close: ContentClose;
} {
    const {isVisible} = useRootVisibility(componentName);
    const {setIsVisible} = useRootActions(componentName);

    const focus = useFocusableRegistry({isVisible});
    // Order matters: `focus` must exist before `subNav` so `resetFocus` is in scope for `onLevelChange`.
    const subNav = useSubNavigation({onLevelChange: focus.resetFocus});

    const close: ContentClose = () => {
        setIsVisible(false);
        subNav.actions.exitSub(null);
    };

    useCloseOnModalCover(isVisible, close);
    useCloseOnScreenBlur(close);

    return {
        navigation: {currentSubID: subNav.currentSubID, isAncestorOfCurrent: subNav.isAncestorOfCurrent},
        focus: {focusedID: focus.focusedID},
        subActions: subNav.actions,
        itemActions: focus.actions,
        close,
    };
}

export default useContentController;
