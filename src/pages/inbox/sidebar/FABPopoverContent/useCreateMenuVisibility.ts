import useDragoverDismiss from '@hooks/useDragoverDismiss';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useState} from 'react';

/** Open state of the create menu, shared by every button that opens it so they open and close it the same way. */
function useCreateMenuVisibility() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);

    const showCreateMenu = () => {
        if (!isFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsCreateMenuActive(true);
    };

    const hideCreateMenu = () => {
        setIsCreateMenuActive(false);
    };

    /** Closes an open menu, otherwise opens it. */
    const toggleCreateMenu = () => {
        if (isCreateMenuActive) {
            hideCreateMenu();
            return;
        }
        showCreateMenu();
    };

    // Close the menu when the screen loses focus (e.g. navigating away)
    useFocusEffect(() => {
        return () => hideCreateMenu();
    });

    // Close menu on dragover, so the popover does not stay open during file drag
    useDragoverDismiss(isCreateMenuActive, hideCreateMenu);

    return {
        isCreateMenuActive,
        isCreateMenuVisible: isCreateMenuActive && (!shouldUseNarrowLayout || isFocused),
        hideCreateMenu,
        toggleCreateMenu,
    };
}

export default useCreateMenuVisibility;
