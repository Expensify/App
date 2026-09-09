import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type {RefObject} from 'react';

import {useEffect, useEffectEvent, useLayoutEffect, useRef} from 'react';

const REPORT_ACTIONS_PAGINATION_THRESHOLD = 0.25;

type PaginationGeometry = {
    scroll: number;
    scrollLength: number;
    contentLength: number;
};

type PaginationListRef = {
    getState: () => PaginationGeometry | undefined;
};

type ReportActionsPaginationDistances = {
    older: number;
    newer: number;
};

type UseReportActionsPaginationScrollArguments = {
    reportID: string;
    linkedReportActionID: string | undefined;
    listRef: RefObject<PaginationListRef | null>;
    viewportHeight: number;
    olderPaginationExtent: number;
    newerPaginationExtent: number;
    olderCursor: string | undefined;
    newerCursor: string | undefined;
    hasOlderActions: boolean;
    hasNewerActions: boolean;
    isLoadingOlderReportActions: boolean;
    isLoadingNewerReportActions: boolean;
    hasLoadingOlderReportActionsError: boolean;
    hasLoadingNewerReportActionsError: boolean;
    isOffline: boolean;
    canLoadOlder: boolean;
    canLoadNewer: boolean;
    loadOlderActions: () => void;
    loadNewerActions: () => void;
};

function useReportActionsPaginationScroll(options: UseReportActionsPaginationScrollArguments) {
    const {
        reportID,
        linkedReportActionID,
        olderCursor,
        newerCursor,
        isLoadingOlderReportActions,
        isLoadingNewerReportActions,
        isOffline,
        canLoadOlder,
        canLoadNewer,
        viewportHeight,
        olderPaginationExtent,
        newerPaginationExtent,
        hasOlderActions,
        hasNewerActions,
    } = options;
    const latestArgumentsRef = useRef(options);
    const lastRequestedOlderCursorRef = useRef<string | undefined>(undefined);
    const lastRequestedNewerCursorRef = useRef<string | undefined>(undefined);
    const wasNearOlderBoundaryRef = useRef(false);
    const wasNearNewerBoundaryRef = useRef(false);
    const wasOfflineRef = useRef(isOffline);
    const couldLoadOlderRef = useRef(canLoadOlder);
    const couldLoadNewerRef = useRef(canLoadNewer);
    const wasLoadingOlderRef = useRef(isLoadingOlderReportActions);
    const wasLoadingNewerRef = useRef(isLoadingNewerReportActions);
    const paginationWindowGenerationRef = useRef(0);
    const scheduledFramesRef = useRef(new Set<number>());

    useLayoutEffect(() => {
        latestArgumentsRef.current = options;
    });

    const scheduleFrame = (callback: () => void, generation?: number) => {
        const expectedGeneration = generation ?? paginationWindowGenerationRef.current;
        const frame = requestAnimationFrame(() => {
            scheduledFramesRef.current.delete(frame);
            if (expectedGeneration === paginationWindowGenerationRef.current) {
                callback();
            }
        });
        scheduledFramesRef.current.add(frame);
    };

    const cancelScheduledFrames = () => {
        for (const frame of scheduledFramesRef.current) {
            cancelAnimationFrame(frame);
        }
        scheduledFramesRef.current.clear();
    };

    const requestNewerActions = (cursor: string, canRetryError: boolean) => {
        const runRequest = () => {
            const latestArguments = latestArgumentsRef.current;
            if (
                latestArguments.newerCursor !== cursor ||
                lastRequestedNewerCursorRef.current !== cursor ||
                !latestArguments.canLoadNewer ||
                !latestArguments.hasNewerActions ||
                latestArguments.isOffline ||
                latestArguments.isLoadingNewerReportActions ||
                (latestArguments.hasLoadingNewerReportActionsError && !canRetryError)
            ) {
                return;
            }
            latestArguments.loadNewerActions();
        };

        if (!isSearchTopmostFullScreenRoute()) {
            runRequest();
            return;
        }

        const generation = paginationWindowGenerationRef.current;
        TransitionTracker.runAfterTransitions({callback: () => scheduleFrame(runRequest, generation)});
    };

    const checkPaginationBoundaries = () => {
        const latestArguments = latestArgumentsRef.current;
        const listState = latestArguments.listRef.current?.getState();
        if (!listState || latestArguments.viewportHeight <= 0) {
            return;
        }

        const distances = getReportActionsPaginationDistances(listState, latestArguments.olderPaginationExtent, latestArguments.newerPaginationExtent);
        const threshold = latestArguments.viewportHeight * REPORT_ACTIONS_PAGINATION_THRESHOLD;
        const isNearOlderBoundary = distances.older <= threshold;
        const isNearNewerBoundary = distances.newer <= threshold;
        if (!isNearOlderBoundary) {
            lastRequestedOlderCursorRef.current = undefined;
        }
        if (!isNearNewerBoundary) {
            lastRequestedNewerCursorRef.current = undefined;
        }

        const canRetryOlderError = !wasNearOlderBoundaryRef.current;
        const canRetryNewerError = !wasNearNewerBoundaryRef.current;

        if (
            isNearOlderBoundary &&
            latestArguments.canLoadOlder &&
            latestArguments.hasOlderActions &&
            !latestArguments.isOffline &&
            !latestArguments.isLoadingOlderReportActions &&
            (!latestArguments.hasLoadingOlderReportActionsError || canRetryOlderError) &&
            latestArguments.olderCursor &&
            lastRequestedOlderCursorRef.current !== latestArguments.olderCursor
        ) {
            lastRequestedOlderCursorRef.current = latestArguments.olderCursor;
            latestArguments.loadOlderActions();
        }

        if (
            isNearNewerBoundary &&
            latestArguments.canLoadNewer &&
            latestArguments.hasNewerActions &&
            !latestArguments.isOffline &&
            !latestArguments.isLoadingNewerReportActions &&
            (!latestArguments.hasLoadingNewerReportActionsError || canRetryNewerError) &&
            latestArguments.newerCursor &&
            lastRequestedNewerCursorRef.current !== latestArguments.newerCursor
        ) {
            lastRequestedNewerCursorRef.current = latestArguments.newerCursor;
            requestNewerActions(latestArguments.newerCursor, canRetryNewerError);
        }

        wasNearOlderBoundaryRef.current = isNearOlderBoundary;
        wasNearNewerBoundaryRef.current = isNearNewerBoundary;
    };

    const schedulePaginationBoundaryCheck = () => scheduleFrame(checkPaginationBoundaries);
    const cancelScheduledFramesEffect = useEffectEvent(cancelScheduledFrames);
    const schedulePaginationBoundaryCheckEffect = useEffectEvent(schedulePaginationBoundaryCheck);

    useEffect(() => {
        paginationWindowGenerationRef.current += 1;
        cancelScheduledFramesEffect();
        lastRequestedOlderCursorRef.current = undefined;
        lastRequestedNewerCursorRef.current = undefined;
        wasNearOlderBoundaryRef.current = false;
        wasNearNewerBoundaryRef.current = false;
        schedulePaginationBoundaryCheckEffect();
    }, [reportID, linkedReportActionID]);

    useEffect(() => {
        lastRequestedOlderCursorRef.current = undefined;
        schedulePaginationBoundaryCheckEffect();
    }, [olderCursor]);

    useEffect(() => {
        lastRequestedNewerCursorRef.current = undefined;
        schedulePaginationBoundaryCheckEffect();
    }, [newerCursor]);

    useEffect(() => {
        const finishedLoadingOlder = wasLoadingOlderRef.current && !isLoadingOlderReportActions;
        const finishedLoadingNewer = wasLoadingNewerRef.current && !isLoadingNewerReportActions;
        wasLoadingOlderRef.current = isLoadingOlderReportActions;
        wasLoadingNewerRef.current = isLoadingNewerReportActions;
        if (finishedLoadingOlder || finishedLoadingNewer) {
            schedulePaginationBoundaryCheckEffect();
        }
    }, [isLoadingOlderReportActions, isLoadingNewerReportActions]);

    useEffect(() => {
        const didReconnect = wasOfflineRef.current && !isOffline;
        wasOfflineRef.current = isOffline;
        if (!didReconnect) {
            return;
        }

        lastRequestedOlderCursorRef.current = undefined;
        lastRequestedNewerCursorRef.current = undefined;
        wasNearOlderBoundaryRef.current = false;
        wasNearNewerBoundaryRef.current = false;
        schedulePaginationBoundaryCheckEffect();
    }, [isOffline]);

    useEffect(() => {
        const canNowLoadOlder = !couldLoadOlderRef.current && canLoadOlder;
        couldLoadOlderRef.current = canLoadOlder;
        if (!canNowLoadOlder) {
            return;
        }
        lastRequestedOlderCursorRef.current = undefined;
        wasNearOlderBoundaryRef.current = false;
        schedulePaginationBoundaryCheckEffect();
    }, [canLoadOlder]);

    useEffect(() => {
        const canNowLoadNewer = !couldLoadNewerRef.current && canLoadNewer;
        couldLoadNewerRef.current = canLoadNewer;
        if (!canNowLoadNewer) {
            return;
        }
        lastRequestedNewerCursorRef.current = undefined;
        wasNearNewerBoundaryRef.current = false;
        schedulePaginationBoundaryCheckEffect();
    }, [canLoadNewer]);

    useEffect(() => {
        schedulePaginationBoundaryCheckEffect();
    }, [viewportHeight, olderPaginationExtent, newerPaginationExtent, hasOlderActions, hasNewerActions]);

    useEffect(
        () => () => {
            paginationWindowGenerationRef.current += 1;
            cancelScheduledFramesEffect();
        },
        [],
    );

    return {
        onScroll: checkPaginationBoundaries,
        onContentSizeChange: schedulePaginationBoundaryCheck,
    };
}

function getReportActionsPaginationDistances(
    {scroll, scrollLength, contentLength}: PaginationGeometry,
    olderPaginationExtent: number,
    newerPaginationExtent: number,
): ReportActionsPaginationDistances {
    return {
        older: scroll - olderPaginationExtent,
        newer: contentLength - scrollLength - scroll - newerPaginationExtent,
    };
}

export default useReportActionsPaginationScroll;
export {REPORT_ACTIONS_PAGINATION_THRESHOLD};
