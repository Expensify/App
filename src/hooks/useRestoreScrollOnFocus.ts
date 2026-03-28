import {useEffect, useRef} from 'react';
import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/FlatList/hooks/useFlatListScrollKey';
import usePrevious from './usePrevious';

/**
 * Re-scrolls to the bottom when a screen regains focus, if the user was near the bottom before navigating away.
 */
function useRestoreScrollOnFocus(isFocused: boolean, scrollOffsetRef: React.RefObject<number>, scrollToBottom: () => void, linkedReportActionID?: string) {
    const prevIsFocused = usePrevious(isFocused);
    const scrollOffsetBeforeBlurRef = useRef<number>(Infinity);

    useEffect(() => {
        if (linkedReportActionID) {
            return;
        }

        if (prevIsFocused && !isFocused) {
            scrollOffsetBeforeBlurRef.current = scrollOffsetRef.current;
        }
        if (!prevIsFocused && isFocused && scrollOffsetBeforeBlurRef.current < AUTOSCROLL_TO_TOP_THRESHOLD) {
            requestAnimationFrame(() => {
                scrollToBottom();
            });
        }
    }, [isFocused, prevIsFocused, scrollOffsetRef, scrollToBottom, linkedReportActionID]);
}

export default useRestoreScrollOnFocus;
