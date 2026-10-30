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

    /**
     * Closes an open menu, otherwise opens it.
     * @param beforeShow runs first when opening, e.g. to measure where the menu goes; the menu opens once it settles
     */
    const toggleCreateMenu = (beforeShow?: () => Promise<unknown>) => {
        if (isCreateMenuActive) {
            hideCreateMenu();
            return;
        }
        if (!beforeShow) {
            showCreateMenu();
            return;
        }
        beforeShow().then(showCreateMenu);
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
        showCreateMenu,
        hideCreateMenu,
        toggleCreateMenu,
    };
}

export default useCreateMenuVisibility;
