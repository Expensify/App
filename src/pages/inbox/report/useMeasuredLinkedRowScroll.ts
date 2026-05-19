/* eslint-disable no-param-reassign */
import {useEffect, useRef} from 'react';
import useReportScrollManager from '@hooks/useReportScrollManager';
import type * as OnyxTypes from '@src/types/onyx';
import {getMeasuredLinkedRowScrollViewOffset} from './InitialViewportUtils';

const MEASURED_ANCHOR_SCROLL_RETRY_LIMIT = 10;
const MEASURED_ANCHOR_SCROLL_FOLLOW_UP_FRAMES = 3;

type MeasuredAnchorScrollRef = {
    scrollToIndex: (params: {index: number; animated: boolean; viewOffset: number}) => Promise<void> | void;
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

type MeasuredScrollRuntime = {
    hasCommittedScroll: boolean;
    shouldSkipScroll: boolean;
    pendingFrameId: number | undefined;
    retryCount: number;
    rowHeight: number;
};

function createMeasuredScrollRuntime(): MeasuredScrollRuntime {
    return {
        hasCommittedScroll: false,
        shouldSkipScroll: false,
        pendingFrameId: undefined,
        retryCount: 0,
        rowHeight: 0,
    };
}

function cancelPendingMeasuredScrollFrame(runtime: MeasuredScrollRuntime) {
    if (runtime.pendingFrameId === undefined) {
        return;
    }

    cancelAnimationFrame(runtime.pendingFrameId);
    runtime.pendingFrameId = undefined;
}

function resetMeasuredScrollRuntime(runtime: MeasuredScrollRuntime) {
    cancelPendingMeasuredScrollFrame(runtime);
    runtime.hasCommittedScroll = false;
    runtime.retryCount = 0;
    runtime.rowHeight = 0;
}

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

        const viewOffset = getMeasuredLinkedRowScrollViewOffset(listHeight, layoutHeight);

        const schedulePrimaryScroll = () => {
            runtime.pendingFrameId = requestAnimationFrame(performScroll);
        };

        const scheduleFollowUpScrolls = (remainingFrames: number) => {
            if (remainingFrames <= 0) {
                return;
            }

            requestAnimationFrame(() => {
                tryApplyMeasuredAnchorScroll(layoutHeight, {isFollowUp: true});
                scheduleFollowUpScrolls(remainingFrames - 1);
            });
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
                    viewOffset,
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
                        onMeasuredScrollApplied();
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

export default useMeasuredLinkedRowScroll;
