import {useCallback, useState} from 'react';
import type {UseWebSelectionListBehaviorOptions, UseWebSelectionListBehaviorResult} from './types';

/**
 * Native platforms don't need web-specific behaviors like touch detection or keyboard scroll debouncing.
 * This returns safe defaults that won't affect native behavior.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useWebSelectionListBehavior(_options: UseWebSelectionListBehaviorOptions = {}): UseWebSelectionListBehaviorResult {
    const [shouldDisableHoverStyle, setShouldDisableHoverStyle] = useState(false);

    const onScroll = useCallback(() => {}, []);

    return {
        shouldIgnoreFocus: false,
        shouldDebounceScrolling: false,
        shouldDisableHoverStyle,
        setShouldDisableHoverStyle,
        onScroll,
    };
}

export default useWebSelectionListBehavior;
