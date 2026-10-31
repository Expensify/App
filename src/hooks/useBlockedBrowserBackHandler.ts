/**
 * Runs a callback while the screen is focused, each time a navigation guard blocks a browser back press.
 */
import {addBlockedBrowserBackListener} from '@libs/Navigation/AppNavigator/createRootStackNavigator/recordBlockedNavigation';

import {useFocusEffect} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

function useBlockedBrowserBackHandler(onBlockedBrowserBack: () => void) {
    // The listener reads the callback through a ref, so a re-render right after a press doesn't resubscribe and drop the pending press.
    const onBlockedBrowserBackRef = useRef(onBlockedBrowserBack);
    useEffect(() => {
        onBlockedBrowserBackRef.current = onBlockedBrowserBack;
    });

    useFocusEffect(() => addBlockedBrowserBackListener(() => onBlockedBrowserBackRef.current()));
}

export default useBlockedBrowserBackHandler;
