import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type * as OnyxTypes from '@src/types/onyx';
import {computeInitialViewportRange, findInitialScrollIndex, isInitialViewportCovered, isUnreadMarkerOnlyInitialScrollKeyChange} from './InitialViewportUtils';
import type {InitialViewportResetSession} from './InitialViewportUtils';
import useMeasuredLinkedRowScroll from './useMeasuredLinkedRowScroll';

const LINKED_OLDER_REVEAL_FALLBACK_MS = 800;
const MEASURED_SCROLL_FALLBACK_MS = 3000;

type UseCenteredInitialScrollKeyListProps = {
    /** The initial scroll key to use for the list. */
    initialScrollKey: string | undefined;
    /** The sorted visible report actions. */
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    /** The key extractor for the report actions. */
    keyExtractor: (item: OnyxTypes.ReportAction) => string;
    /** The linked report action ID. */
    linkedReportActionID: string | undefined;
    /** Whether the report has older actions. */
    hasOlderActions: boolean;
    /** The report loading state. */
    reportLoadingState: OnyxTypes.ReportLoadingState | undefined;
    /** Whether to focus to the top of the list on mount. */
    shouldFocusToTopOnMount: boolean;
    /** The list ID. */
    listID: string;
    /** The report. */
    report: OnyxTypes.Report;
    /** The callback to call when the list is loaded. */
    onLoad: () => void;
};

/** This hook is used to vertically center the linked/unread report action
 * within the list when the report is openend initially.
 */
function useCenteredInitialScrollKeyList({
    initialScrollKey,
    sortedVisibleReportActions,
    keyExtractor,
    linkedReportActionID,
    hasOlderActions,
    reportLoadingState,
    shouldFocusToTopOnMount,
    listID,
    report,
    onLoad,
}: UseCenteredInitialScrollKeyListProps) {
    const {windowHeight} = useWindowDimensions();
    const sessionRef = useRef<InitialViewportResetSession | undefined>(undefined);
    const [sessionSnapshot, setSessionSnapshot] = useState<InitialViewportResetSession | undefined>(undefined);

    const isMarkUnreadOnlyScrollKeyChange = isUnreadMarkerOnlyInitialScrollKeyChange(sessionSnapshot, listID, report.reportID, linkedReportActionID, initialScrollKey);
    const initialScrollKeyForInitialScroll = isMarkUnreadOnlyScrollKeyChange ? undefined : initialScrollKey;

    const initialScrollIndex = findInitialScrollIndex(sortedVisibleReportActions, keyExtractor, initialScrollKeyForInitialScroll);
    const hasInitialScrollTarget = initialScrollIndex >= 0;
    const shouldMeasureScrollTarget = !!initialScrollKeyForInitialScroll && hasInitialScrollTarget;

    const [listHeight, setListHeight] = useState(0);
    const [isInitialViewportLoading, setIsInitialViewportLoading] = useState(true);
    const [hasAppliedMeasuredScroll, setHasAppliedMeasuredScroll] = useState(() => !shouldMeasureScrollTarget);
    const [isLinkedOlderRevealReady, setIsLinkedOlderRevealReady] = useState(() => !(!!linkedReportActionID && hasOlderActions));

    const mountedViewportIndicesRef = useRef(new Set<number>());
    const hasInitialViewportLoadedRef = useRef(!hasInitialScrollTarget);

    const isLoadingOlderReportActions = reportLoadingState?.isLoadingOlderReportActions;
    const isLinkedOpen = !!linkedReportActionID;
    const shouldDeferLinkedOlderReveal = isLinkedOpen && hasOlderActions;

    const {handleInitialScrollTargetLayout, resetMeasuredScroll, skipMeasuredScroll} = useMeasuredLinkedRowScroll({
        canMeasureScrollTarget: shouldMeasureScrollTarget,
        initialScrollKeyForInitialScroll,
        sortedVisibleReportActions,
        keyExtractor,
        listHeight,
        linkedReportActionID,
        isLoadingOlderReportActions,
        visibleActionCount: sortedVisibleReportActions.length,
        onMeasuredScrollApplied: () => setHasAppliedMeasuredScroll(true),
    });

    const initialViewportRange = computeInitialViewportRange(listHeight, initialScrollIndex, sortedVisibleReportActions.length);
    const shouldRenderFlashList = !hasInitialScrollTarget || listHeight > 0;

    const isWaitingForMeasuredScroll = shouldMeasureScrollTarget && !hasAppliedMeasuredScroll;
    const isWaitingForLinkedOlderPagination = shouldDeferLinkedOlderReveal && (!isLinkedOlderRevealReady || !!isLoadingOlderReportActions);
    const shouldShowInitialViewportSkeleton = hasInitialScrollTarget && (isInitialViewportLoading || isWaitingForMeasuredScroll || isWaitingForLinkedOlderPagination);

    const initialScrollIndexViewOffset = hasInitialScrollTarget ? -Math.max(listHeight / 2, 0) : undefined;
    let initialScrollIndexParams;
    if (shouldFocusToTopOnMount) {
        initialScrollIndexParams = {viewOffset: windowHeight};
    } else if (initialScrollIndexViewOffset === undefined) {
        initialScrollIndexParams = undefined;
    } else {
        initialScrollIndexParams = {viewOffset: initialScrollIndexViewOffset};
    }

    useLayoutEffect(() => {
        let isCancelled = false;

        const publishSessionSnapshot = (session: InitialViewportResetSession) => {
            queueMicrotask(() => {
                if (isCancelled) {
                    return;
                }
                setSessionSnapshot(session);
            });
        };

        const nextSession: InitialViewportResetSession = {
            listID,
            reportID: report.reportID,
            linkedReportActionID,
            initialScrollKey,
        };

        const previousSession = sessionRef.current;
        sessionRef.current = nextSession;

        const isMarkUnreadOnlySessionUpdate = isUnreadMarkerOnlyInitialScrollKeyChange(previousSession, listID, report.reportID, linkedReportActionID, initialScrollKey);

        if (isMarkUnreadOnlySessionUpdate) {
            skipMeasuredScroll();
            setHasAppliedMeasuredScroll(true);
            return () => {
                isCancelled = true;
            };
        }

        publishSessionSnapshot(nextSession);
        setIsLinkedOlderRevealReady(!shouldDeferLinkedOlderReveal);
        resetMeasuredScroll();

        mountedViewportIndicesRef.current.clear();
        hasInitialViewportLoadedRef.current = !hasInitialScrollTarget;
        setHasAppliedMeasuredScroll(!shouldMeasureScrollTarget);
        setIsInitialViewportLoading(hasInitialScrollTarget);

        return () => {
            isCancelled = true;
        };
    }, [
        hasInitialScrollTarget,
        hasOlderActions,
        initialScrollKey,
        linkedReportActionID,
        listID,
        report.reportID,
        resetMeasuredScroll,
        shouldDeferLinkedOlderReveal,
        shouldMeasureScrollTarget,
        skipMeasuredScroll,
    ]);

    useEffect(() => {
        let cancelled = false;
        let animationFrameId = 0;
        let fallbackTimeoutId: ReturnType<typeof setTimeout> | undefined;

        const setRevealReadyOnNextFrame = (isReady: boolean) => {
            animationFrameId = requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }

                setIsLinkedOlderRevealReady(isReady);
            });
        };

        const shouldOpenRevealGateImmediately = !shouldDeferLinkedOlderReveal;
        const isWaitingForInitialViewport = !hasAppliedMeasuredScroll || isInitialViewportLoading;
        const isFetchingOlderMessages = !!isLoadingOlderReportActions;

        if (shouldOpenRevealGateImmediately) {
            setRevealReadyOnNextFrame(true);
        } else if (isWaitingForInitialViewport) {
            setRevealReadyOnNextFrame(false);
        } else if (isFetchingOlderMessages) {
            setRevealReadyOnNextFrame(true);
        } else {
            animationFrameId = requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }

                fallbackTimeoutId = setTimeout(() => {
                    if (cancelled) {
                        return;
                    }

                    setIsLinkedOlderRevealReady(true);
                }, LINKED_OLDER_REVEAL_FALLBACK_MS);
            });
        }

        return () => {
            cancelled = true;
            cancelAnimationFrame(animationFrameId);

            if (fallbackTimeoutId) {
                clearTimeout(fallbackTimeoutId);
            }
        };
    }, [hasAppliedMeasuredScroll, isInitialViewportLoading, isLoadingOlderReportActions, linkedReportActionID, listID, report.reportID, shouldDeferLinkedOlderReveal]);

    useEffect(() => {
        if (!shouldMeasureScrollTarget || hasAppliedMeasuredScroll) {
            return undefined;
        }

        const fallbackTimer = setTimeout(() => {
            setHasAppliedMeasuredScroll(true);
        }, MEASURED_SCROLL_FALLBACK_MS);

        return () => {
            clearTimeout(fallbackTimer);
        };
    }, [hasAppliedMeasuredScroll, listID, report.reportID, shouldMeasureScrollTarget]);

    const handleReportActionsListLayout = (event: LayoutChangeEvent) => {
        const nextListHeight = event.nativeEvent.layout.height;
        const hasListHeightChanged = Math.round(listHeight) !== Math.round(nextListHeight);

        if (!hasListHeightChanged) {
            return;
        }

        if (!hasInitialViewportLoadedRef.current) {
            mountedViewportIndicesRef.current.clear();
            setIsInitialViewportLoading(hasInitialScrollTarget);
        }

        setListHeight(nextListHeight);
    };

    const handleInitialViewportItemMounted = (index: number) => {
        if (!initialViewportRange || hasInitialViewportLoadedRef.current) {
            return;
        }

        const isInsideInitialViewport = index >= initialViewportRange.first && index <= initialViewportRange.last;
        if (!isInsideInitialViewport) {
            return;
        }

        mountedViewportIndicesRef.current.add(index);

        const isInitialViewportReady = isInitialViewportCovered(mountedViewportIndicesRef.current, initialViewportRange, initialScrollIndex);
        if (!isInitialViewportReady) {
            return;
        }

        hasInitialViewportLoadedRef.current = true;
        setIsInitialViewportLoading(false);
        onLoad();
    };

    return {
        initialViewportRange,
        isInitialViewportLoading,
        initialScrollIndexParams,
        shouldRenderFlashList,
        shouldShowInitialViewportSkeleton,
        handleInitialScrollTargetLayout,
        handleReportActionsListLayout,
        handleInitialViewportItemMounted,
        hasInitialScrollTarget,
        initialScrollKeyForInitialScroll,
    };
}

export default useCenteredInitialScrollKeyList;
