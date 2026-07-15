import {AUTOSCROLL_TO_TOP_THRESHOLD} from '@components/FlatList/hooks/useFlatListScrollKey';

import type React from 'react';

import {useEffect, useLayoutEffect, useRef} from 'react';

import usePrevious from './usePrevious';

type UseScrollToEndOnPaginationMergeParams = {
    /** The ref to the scroll offset. */
    scrollingVerticalOffsetRef: React.RefObject<number>;
    /** The ID of the last visible report action. */
    lastActionID?: string;
    /** The length of the visible report actions. */
    visibleActionsLength: number;
    /** The length of the report actions. */
    reportActionsLength?: number;
    /** Whether the newest report action is the last visible report action. */
    hasNewestReportAction: boolean;
    /** The function to set the floating message counter visible. */
    setIsFloatingMessageCounterVisible: (isVisible: boolean) => void;
    /** The function to scroll to the end. */
    scrollToEnd: () => void;
    /**
     * Inbox uses `previousLength !== currentLength` to detect pagination merges.
     * Money request uses `previousLength > reportActionsLength`.
     */
    sizeChangeType?: 'changed' | 'grewFromReportActions';
    /**
     * Included only to re-run the effect when routing/initial scroll target changes.
     * The value does not need to be used inside the effect.
     */
    resetKey?: unknown;
};

function useScrollToEndOnNewMessageReceived({
    scrollingVerticalOffsetRef,
    lastActionID,
    visibleActionsLength,
    reportActionsLength,
    hasNewestReportAction,
    setIsFloatingMessageCounterVisible,
    scrollToEnd,
    sizeChangeType = 'changed',
    resetKey,
}: UseScrollToEndOnPaginationMergeParams) {
    const previousLastIndex = useRef(lastActionID);
    const reportActionSize = useRef(visibleActionsLength);
    const previousResetKeyRef = useRef<unknown>(undefined);
    const prevHasNewestReportAction = usePrevious(hasNewestReportAction);

    // When the hook is used across report navigations, baselines from the previous report must not drive scroll logic.
    useLayoutEffect(() => {
        if (resetKey === undefined) {
            return;
        }
        if (previousResetKeyRef.current === resetKey) {
            return;
        }
        previousResetKeyRef.current = resetKey;
        previousLastIndex.current = lastActionID;
        reportActionSize.current = visibleActionsLength;
    }, [resetKey, lastActionID, visibleActionsLength]);

    useEffect(() => {
        const didListSizeChange = sizeChangeType === 'grewFromReportActions' ? reportActionSize.current > (reportActionsLength ?? 0) : reportActionSize.current !== visibleActionsLength;

        if (
            scrollingVerticalOffsetRef.current < AUTOSCROLL_TO_TOP_THRESHOLD &&
            previousLastIndex.current !== lastActionID &&
            didListSizeChange &&
            hasNewestReportAction &&
            // We don't want to trigger a scroll to the end if the
            // user was not already close to the end of the chat.
            // When we link to a specific report action and there are
            // no report actions in Onyx, the report action pages might
            // merge, which would cause a scroll to the end otherwise.
            prevHasNewestReportAction
        ) {
            setIsFloatingMessageCounterVisible(false);
            scrollToEnd();
        }

        previousLastIndex.current = lastActionID;
        reportActionSize.current = visibleActionsLength;
    }, [
        scrollingVerticalOffsetRef,
        lastActionID,
        reportActionsLength,
        visibleActionsLength,
        hasNewestReportAction,
        prevHasNewestReportAction,
        sizeChangeType,
        resetKey,
        setIsFloatingMessageCounterVisible,
        scrollToEnd,
    ]);
}

export default useScrollToEndOnNewMessageReceived;
