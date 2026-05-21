/* eslint-disable no-param-reassign -- The mutable runtime object is intentionally mutated in-place by helper functions to track scroll state without triggering React re-renders */
import {useEffect, useRef} from 'react';
import useReportScrollManager from '@hooks/useReportScrollManager';
import type * as OnyxTypes from '@src/types/onyx';
import {getMeasuredLinkedRowScrollPosition} from './InitialViewportUtils';
import type {MeasuredLinkedRowScrollPosition} from './InitialViewportUtils';

const MEASURED_ANCHOR_SCROLL_RETRY_LIMIT = 10;
const MEASURED_ANCHOR_SCROLL_FOLLOW_UP_FRAMES = 3;

type MeasuredAnchorScrollRef = {
    /** The method to scroll to an index in the list. */
    scrollToIndex: (params: {index: number; animated: boolean} & MeasuredLinkedRowScrollPosition) => Promise<void> | void;
};

type UseMeasuredLinkedRowScrollProps = {
    canMeasureScrollTarget: boolean;
    initialScrollKeyForInitialScroll: string | undefined;
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    keyExtractor: (item: OnyxTypes.ReportAction) => string;
    listHeight: number;
    linkedReportActionID: string | undefined;
    isLoadingOlderReportActions: boolean | undefined;
    visibleActionCount: number;
    onMeasuredScrollApplied: () => void;
};

/** This hook is used to measure the scroll position of the linked/unread report action
 * within the list when the report is opened initially.
 */
function useMeasuredLinkedRowScroll({
    canMeasureScrollTarget,
    initialScrollKeyForInitialScroll,
    sortedVisibleReportActions,
    keyExtractor,
    listHeight,
    linkedReportActionID,
    isLoadingOlderReportActions,
    visibleActionCount,
    onMeasuredScrollApplied,
}: UseMeasuredLinkedRowScrollProps) {
    const reportScrollManager = useReportScrollManager();
    const runtimeRef = useRef<MeasuredScrollRuntime>(createMeasuredScrollRuntime());
    const previousVisibleActionCountRef = useRef(visibleActionCount);
    const previousIsLoadingOlderReportActionsRef = useRef(isLoadingOlderReportActions);

    const tryApplyMeasuredAnchorScroll = (layoutHeight: number, {isFollowUp = false}: {isFollowUp?: boolean} = {}) => {
        const runtime = runtimeRef.current;
        const canScroll = canMeasureScrollTarget && !runtime.shouldSkipScroll && layoutHeight > 0 && listHeight > 0;

        if (!canScroll) {
            return;
        }

        const isPrimaryScrollAttempt = !isFollowUp;
        const isScrollAlreadyScheduled = runtime.hasCommittedScroll || runtime.pendingFrameId !== undefined;

        if (isPrimaryScrollAttempt && isScrollAlreadyScheduled) {
            return;
        }

        const scrollIndex = sortedVisibleReportActions.findIndex((item) => keyExtractor(item) === initialScrollKeyForInitialScroll);
        if (scrollIndex < 0) {
            return;
        }

        const scrollPosition = getMeasuredLinkedRowScrollPosition(listHeight, layoutHeight);

        const schedulePrimaryScroll = () => {
            runtime.pendingFrameId = requestAnimationFrame(performScroll);
        };

        const scheduleFollowUpScrolls = (remainingFrames: number) => {
            const frameId = requestAnimationFrame(() => {
                runtime.followUpFrameIds = runtime.followUpFrameIds.filter((id) => id !== frameId);

                if (remainingFrames <= 0) {
                    onMeasuredScrollApplied();
                    return;
                }

                tryApplyMeasuredAnchorScroll(layoutHeight, {isFollowUp: true});
                scheduleFollowUpScrolls(remainingFrames - 1);
            });
            runtime.followUpFrameIds.push(frameId);
        };

        const retryPrimaryScroll = () => {
            runtime.retryCount += 1;

            if (runtime.retryCount >= MEASURED_ANCHOR_SCROLL_RETRY_LIMIT) {
                onMeasuredScrollApplied();
                return;
            }

            schedulePrimaryScroll();
        };

        function performScroll() {
            runtime.pendingFrameId = undefined;

            if (isPrimaryScrollAttempt && runtime.hasCommittedScroll) {
                return;
            }

            const flashListRef = reportScrollManager.ref?.current as MeasuredAnchorScrollRef | null;
            if (!flashListRef?.scrollToIndex) {
                if (isPrimaryScrollAttempt) {
                    retryPrimaryScroll();
                }
                return;
            }

            if (isPrimaryScrollAttempt) {
                runtime.hasCommittedScroll = true;
            }

            let scrollResult: Promise<void> | void;

            try {
                scrollResult = flashListRef.scrollToIndex({
                    index: scrollIndex,
                    animated: false,
                    ...scrollPosition,
                });
            } catch {
                if (isPrimaryScrollAttempt) {
                    runtime.hasCommittedScroll = false;
                    retryPrimaryScroll();
                }
                return;
            }

            Promise.resolve(scrollResult)
                .then(() => {
                    if (isPrimaryScrollAttempt && !runtime.hasCommittedScroll) {
                        return;
                    }

                    if (isPrimaryScrollAttempt) {
                        scheduleFollowUpScrolls(MEASURED_ANCHOR_SCROLL_FOLLOW_UP_FRAMES);
                    }
                })
                .catch(() => {
                    if (isFollowUp) {
                        return;
                    }

                    runtime.hasCommittedScroll = false;
                    retryPrimaryScroll();
                });
        }

        if (isFollowUp) {
            performScroll();
            return;
        }

        schedulePrimaryScroll();
    };

    const handleInitialScrollTargetLayout = (layoutHeight: number) => {
        runtimeRef.current.rowHeight = layoutHeight;
        tryApplyMeasuredAnchorScroll(layoutHeight);
    };
    const skipMeasuredScroll = () => {
        const runtime = runtimeRef.current;
        runtime.shouldSkipScroll = true;
        resetMeasuredScrollRuntime(runtime);
    };

    const resetMeasuredScroll = () => {
        const runtime = runtimeRef.current;
        runtime.shouldSkipScroll = false;
        resetMeasuredScrollRuntime(runtime);
    };

    useEffect(
        () => () => {
            cancelPendingMeasuredScrollFrame(runtimeRef.current);
        },
        [],
    );

    useEffect(() => {
        const previousVisibleActionCount = previousVisibleActionCountRef.current;
        const previousIsLoadingOlderReportActions = previousIsLoadingOlderReportActionsRef.current;
        const runtime = runtimeRef.current;

        previousVisibleActionCountRef.current = visibleActionCount;
        previousIsLoadingOlderReportActionsRef.current = isLoadingOlderReportActions;

        const hasLinkedOpenContext = !!linkedReportActionID && !!initialScrollKeyForInitialScroll && runtime.rowHeight > 0 && listHeight > 0;
        const didAppendVisibleActions = visibleActionCount > previousVisibleActionCount;
        const didFinishLoadingOlderReportActions = previousIsLoadingOlderReportActions && !isLoadingOlderReportActions;
        const shouldRealignAfterPagination = didAppendVisibleActions || didFinishLoadingOlderReportActions;

        if (!hasLinkedOpenContext || !shouldRealignAfterPagination) {
            return;
        }

        runtime.hasCommittedScroll = false;
        runtime.retryCount = 0;
        tryApplyMeasuredAnchorScroll(runtime.rowHeight);
    }, [initialScrollKeyForInitialScroll, isLoadingOlderReportActions, linkedReportActionID, listHeight, tryApplyMeasuredAnchorScroll, visibleActionCount]);

    return {
        handleInitialScrollTargetLayout,
        resetMeasuredScroll,
        skipMeasuredScroll,
    };
}

type MeasuredScrollRuntime = {
    hasCommittedScroll: boolean;
    shouldSkipScroll: boolean;
    pendingFrameId: number | undefined;
    followUpFrameIds: number[];
    retryCount: number;
    rowHeight: number;
};

function createMeasuredScrollRuntime(): MeasuredScrollRuntime {
    return {
        hasCommittedScroll: false,
        shouldSkipScroll: false,
        pendingFrameId: undefined,
        followUpFrameIds: [],
        retryCount: 0,
        rowHeight: 0,
    };
}

function cancelPendingMeasuredScrollFrame(runtime: MeasuredScrollRuntime) {
    if (runtime.pendingFrameId !== undefined) {
        cancelAnimationFrame(runtime.pendingFrameId);
        runtime.pendingFrameId = undefined;
    }

    for (const frameId of runtime.followUpFrameIds) {
        cancelAnimationFrame(frameId);
    }
    runtime.followUpFrameIds = [];
}

function resetMeasuredScrollRuntime(runtime: MeasuredScrollRuntime) {
    cancelPendingMeasuredScrollFrame(runtime);
    runtime.hasCommittedScroll = false;
    runtime.retryCount = 0;
    runtime.rowHeight = 0;
}

export default useMeasuredLinkedRowScroll;
