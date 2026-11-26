/**
 * Keeps picker options available through dismissal, and starts a fresh search when a popover opens or changes presentation.
 */
import {useState} from 'react';

import useResponsiveLayout from './useResponsiveLayout';

function usePickerPopoverSession(isVisible: boolean, onModalHide?: () => void) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- Match the presentation switch in PopoverWithMeasuredContent, which remounts its list.
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [session, setSession] = useState({isVisible, isSmallScreenWidth, searchKey: 0, shouldPrepareOptions: isVisible});

    if (session.isVisible !== isVisible || session.isSmallScreenWidth !== isSmallScreenWidth) {
        setSession({
            isVisible,
            isSmallScreenWidth,
            searchKey: isVisible ? session.searchKey + 1 : session.searchKey,
            shouldPrepareOptions: isVisible || session.shouldPrepareOptions,
        });
    }

    const finishClosing = () => {
        // A hide callback can arrive after the picker has already reopened.
        setSession((current) => (current.isVisible || !current.shouldPrepareOptions ? current : {...current, shouldPrepareOptions: false}));
        onModalHide?.();
    };

    return {searchKey: session.searchKey, shouldPrepareOptions: session.shouldPrepareOptions, finishClosing};
}

export default usePickerPopoverSession;
