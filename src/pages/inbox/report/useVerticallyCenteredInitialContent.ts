import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const INITIAL_TARGET_REPORT_ACTION_ESTIMATED_HEIGHT = CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT;
const INITIAL_VIEWPORT_OVERSCAN_ITEMS = 2;
const MEASURED_ANCHOR_SCROLL_RETRY_LIMIT = 10;

type InitialViewportRange = {
    first: number;
    last: number;
    requiredMountedItems: number;
};
type UseVerticallyCenteredInitialContentProps = {
    initialScrollKey: string | undefined;
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    keyExtractor: (item: OnyxTypes.ReportAction) => string;
    linkedReportActionID: string | undefined;
    hasOlderActions: boolean;
    reportLoadingState: OnyxTypes.ReportLoadingState | undefined;
    shouldFocusToTopOnMount: boolean;
    listID: string;
    report: OnyxTypes.Report;
    onLoad: () => void;
};

type MeasuredAnchorScrollRef = {
    scrollToIndex: (params: {index: number; animated: boolean; viewOffset: number}) => Promise<void> | void;
};

function isInitialViewportCovered(mountedIndices: Set<number>, range: InitialViewportRange, initialScrollIndex: number) {
    if (mountedIndices.size < range.requiredMountedItems) {
        return false;
    }

    const mountedIndexList = Array.from(mountedIndices);
    const hasItemBeforeInitialTarget = range.first >= initialScrollIndex || mountedIndexList.some((index) => index < initialScrollIndex);
    const hasItemAfterInitialTarget = range.last <= initialScrollIndex || mountedIndexList.some((index) => index > initialScrollIndex);

    return hasItemBeforeInitialTarget && hasItemAfterInitialTarget;
}

function useVerticallyCenteredInitialContent({
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
}: UseVerticallyCenteredInitialContentProps) {
    const reportScrollManager = useReportScrollManager();
    const {windowHeight} = useWindowDimensions();

    const initialScrollIndex = !initialScrollKey ? -1 : sortedVisibleReportActions.findIndex((item) => keyExtractor(item) === initialScrollKey);
    const hasInitialScrollTarget = initialScrollIndex >= 0;
    const shouldMeasureInitialScrollTargetPosition = !!initialScrollKey && hasInitialScrollTarget;
    const [listHeight, setListHeight] = useState(0);
    const [isInitialViewportLoading, setIsInitialViewportLoading] = useState(true);
    /**
     * Linked opens scroll near the anchor immediately; inverted FlashList often fires `onEndReached` right away,
     * fetching older messages after the viewport skeleton drops. Delay revealing the list until we've allowed that
     * fetch to flip `isLoadingOlderReportActions`, then keep the overlay until it clears so rows don't stream in visibly.
     */
    const [linkedOlderRevealGateReady, setLinkedOlderRevealGateReady] = useState(() => !(!!linkedReportActionID && hasOlderActions));
    const mountedInitialViewportIndicesRef = useRef(new Set<number>());
    const hasInitialViewportLoadedRef = useRef(!hasInitialScrollTarget);
    /** Initial target opens need post-layout corrective scroll so the inverted anchor lands correctly. */
    const [hasAppliedMeasuredAnchorScroll, setHasAppliedMeasuredAnchorScroll] = useState(() => !shouldMeasureInitialScrollTargetPosition);
    /** Prevents repeated corrective scrollToIndex calls when onLayout repeats. */
    const hasCommittedMeasuredAnchorScrollRef = useRef(false);
    const measuredAnchorScrollFrameRef = useRef<number | undefined>(undefined);
    const measuredAnchorScrollAttemptCountRef = useRef(0);
    /**
     * Last scroll/viewport-reset session identifiers. Avoids resetting the initial viewport skeleton + measured-anchor
     * scroll when only the unread marker action ID changes during mark-as-unread (same FlashList/listID).
     */
    const initialViewportResetSessionRef = useRef<
        | {
              listID: string;
              reportID: string;
              linkedReportActionID: string | undefined;
              initialScrollKey: string | undefined;
          }
        | undefined
    >(undefined);

    const initialScrollIndexViewOffset = !hasInitialScrollTarget ? undefined : -Math.max(listHeight / 2, 0);

    let initialViewportRange: InitialViewportRange | undefined;
    if (hasInitialScrollTarget && listHeight > 0) {
        const estimatedVisibleReportActions = Math.max(1, Math.ceil(listHeight / INITIAL_TARGET_REPORT_ACTION_ESTIMATED_HEIGHT));
        const radius = Math.ceil(estimatedVisibleReportActions / 2) + INITIAL_VIEWPORT_OVERSCAN_ITEMS;
        const first = Math.max(initialScrollIndex - radius, 0);
        const last = Math.min(initialScrollIndex + radius, sortedVisibleReportActions.length - 1);

        initialViewportRange = {
            first,
            last,
            requiredMountedItems: Math.min(estimatedVisibleReportActions, last - first + 1),
        };
    } else {
        initialViewportRange = undefined;
    }
    const shouldRenderFlashList = !hasInitialScrollTarget || listHeight > 0;
    const shouldAwaitLinkedOlderRevealWhileGateCold = !!linkedReportActionID && hasOlderActions && (!linkedOlderRevealGateReady || !!reportLoadingState?.isLoadingOlderReportActions);
    const shouldShowInitialViewportSkeleton =
        hasInitialScrollTarget && (isInitialViewportLoading || (shouldMeasureInitialScrollTargetPosition && !hasAppliedMeasuredAnchorScroll) || shouldAwaitLinkedOlderRevealWhileGateCold);

    /** Correct inverted initial-target positioning using the laid-out row height. */
    const handleInitialScrollTargetLayout = (layoutHeight: number) => {
        if (!shouldMeasureInitialScrollTargetPosition || layoutHeight <= 0 || listHeight <= 0) {
            return;
        }

        if (hasCommittedMeasuredAnchorScrollRef.current || measuredAnchorScrollFrameRef.current !== undefined) {
            return;
        }

        // Inverted FlashList initially aligns the target row's bottom edge at mid-viewport.
        // Shift by the measured row height so the row's top edge lands there instead.
        const viewOffsetAlignedToTopEdge = -listHeight / 2 + layoutHeight;

        function scheduleMeasuredAnchorScroll() {
            measuredAnchorScrollFrameRef.current = requestAnimationFrame(scrollToMeasuredAnchor);
        }

        function retryMeasuredAnchorScroll() {
            measuredAnchorScrollAttemptCountRef.current += 1;
            if (measuredAnchorScrollAttemptCountRef.current >= MEASURED_ANCHOR_SCROLL_RETRY_LIMIT) {
                setHasAppliedMeasuredAnchorScroll(true);
                return;
            }
            scheduleMeasuredAnchorScroll();
        }

        function scrollToMeasuredAnchor() {
            measuredAnchorScrollFrameRef.current = undefined;
            if (hasCommittedMeasuredAnchorScrollRef.current) {
                return;
            }

            const flashListRef = reportScrollManager.ref?.current as MeasuredAnchorScrollRef | null;
            if (!flashListRef?.scrollToIndex) {
                retryMeasuredAnchorScroll();
                return;
            }

            hasCommittedMeasuredAnchorScrollRef.current = true;

            let scrollResult: Promise<void> | void;
            try {
                scrollResult = flashListRef.scrollToIndex({
                    index: initialScrollIndex,
                    animated: false,
                    viewOffset: viewOffsetAlignedToTopEdge,
                });
            } catch {
                hasCommittedMeasuredAnchorScrollRef.current = false;
                retryMeasuredAnchorScroll();
                return;
            }

            Promise.resolve(scrollResult)
                .then(() => {
                    if (!hasCommittedMeasuredAnchorScrollRef.current) {
                        return;
                    }
                    setHasAppliedMeasuredAnchorScroll(true);
                })
                .catch(() => {
                    hasCommittedMeasuredAnchorScrollRef.current = false;
                    retryMeasuredAnchorScroll();
                });
        }

        scheduleMeasuredAnchorScroll();
    };

    useLayoutEffect(() => {
        const normalizedLinkedReportActionID = linkedReportActionID;
        const normalizedInitialScrollKey = initialScrollKey;
        const previousSession = initialViewportResetSessionRef.current;

        const isFirstViewportResetCycle = previousSession === undefined;
        const listIDBumped = isFirstViewportResetCycle ? true : previousSession.listID !== listID;
        const reportSwitched = isFirstViewportResetCycle ? true : previousSession.reportID !== report.reportID;
        const linkedTargetingChanged = isFirstViewportResetCycle ? false : previousSession.linkedReportActionID !== normalizedLinkedReportActionID;

        const didInitialScrollKeyChange = previousSession?.initialScrollKey !== normalizedInitialScrollKey;
        const isUnreadMarkerOnlyChange =
            didInitialScrollKeyChange && previousSession !== undefined && !normalizedLinkedReportActionID && !listIDBumped && !reportSwitched && !linkedTargetingChanged;

        initialViewportResetSessionRef.current = {
            listID,
            reportID: report.reportID,
            linkedReportActionID: normalizedLinkedReportActionID,
            initialScrollKey: normalizedInitialScrollKey,
        };

        if (isUnreadMarkerOnlyChange) {
            hasCommittedMeasuredAnchorScrollRef.current = false;
            measuredAnchorScrollAttemptCountRef.current = 0;
            if (measuredAnchorScrollFrameRef.current !== undefined) {
                cancelAnimationFrame(measuredAnchorScrollFrameRef.current);
                measuredAnchorScrollFrameRef.current = undefined;
            }
            setHasAppliedMeasuredAnchorScroll(true);
            return;
        }

        const shouldDeferLinkedOlderReveal = !!(normalizedLinkedReportActionID && hasOlderActions);
        setLinkedOlderRevealGateReady(!shouldDeferLinkedOlderReveal);

        mountedInitialViewportIndicesRef.current.clear();
        hasInitialViewportLoadedRef.current = !hasInitialScrollTarget;
        hasCommittedMeasuredAnchorScrollRef.current = false;
        measuredAnchorScrollAttemptCountRef.current = 0;
        if (measuredAnchorScrollFrameRef.current !== undefined) {
            cancelAnimationFrame(measuredAnchorScrollFrameRef.current);
            measuredAnchorScrollFrameRef.current = undefined;
        }
        setHasAppliedMeasuredAnchorScroll(!shouldMeasureInitialScrollTargetPosition);
        setIsInitialViewportLoading(hasInitialScrollTarget);
    }, [hasInitialScrollTarget, hasOlderActions, initialScrollKey, linkedReportActionID, listID, report.reportID, shouldMeasureInitialScrollTargetPosition]);

    useEffect(
        () => () => {
            if (measuredAnchorScrollFrameRef.current === undefined) {
                return;
            }
            cancelAnimationFrame(measuredAnchorScrollFrameRef.current);
        },
        [],
    );

    useEffect(() => {
        let cancelled = false;
        let rafId = 0;
        let fallbackRevealTimeoutId: ReturnType<typeof setTimeout> | undefined;

        const markRevealGateReadyOnNextFrame = (ready: boolean) => {
            rafId = requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }
                setLinkedOlderRevealGateReady(ready);
            });
        };

        if (!linkedReportActionID || !hasOlderActions) {
            markRevealGateReadyOnNextFrame(true);
        } else if (!hasAppliedMeasuredAnchorScroll || isInitialViewportLoading) {
            markRevealGateReadyOnNextFrame(false);
        } else if (reportLoadingState?.isLoadingOlderReportActions) {
            markRevealGateReadyOnNextFrame(true);
        } else {
            rafId = requestAnimationFrame(() => {
                if (cancelled) {
                    return;
                }

                fallbackRevealTimeoutId = setTimeout(() => {
                    if (cancelled) {
                        return;
                    }
                    setLinkedOlderRevealGateReady(true);
                }, 800);
            });
        }

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            if (fallbackRevealTimeoutId) {
                clearTimeout(fallbackRevealTimeoutId);
            }
        };
    }, [hasAppliedMeasuredAnchorScroll, hasOlderActions, isInitialViewportLoading, linkedReportActionID, listID, report.reportID, reportLoadingState?.isLoadingOlderReportActions]);

    useEffect(() => {
        if (!shouldMeasureInitialScrollTargetPosition || hasAppliedMeasuredAnchorScroll) {
            return undefined;
        }

        const fallbackTimer = setTimeout(() => {
            setHasAppliedMeasuredAnchorScroll(true);
        }, 3000);

        return () => {
            clearTimeout(fallbackTimer);
        };
    }, [hasAppliedMeasuredAnchorScroll, listID, report.reportID, shouldMeasureInitialScrollTargetPosition]);

    const handleReportActionsListLayout = (event: LayoutChangeEvent) => {
        const nextListHeight = event.nativeEvent.layout.height;
        if (Math.round(listHeight) === Math.round(nextListHeight)) {
            return;
        }

        if (!hasInitialViewportLoadedRef.current) {
            mountedInitialViewportIndicesRef.current.clear();
            setIsInitialViewportLoading(hasInitialScrollTarget);
        }
        setListHeight(nextListHeight);
    };

    const handleInitialViewportItemMounted = (index: number) => {
        if (!initialViewportRange || hasInitialViewportLoadedRef.current) {
            return;
        }

        if (index < initialViewportRange.first || index > initialViewportRange.last) {
            return;
        }

        mountedInitialViewportIndicesRef.current.add(index);

        if (!isInitialViewportCovered(mountedInitialViewportIndicesRef.current, initialViewportRange, initialScrollIndex)) {
            return;
        }

        hasInitialViewportLoadedRef.current = true;
        setIsInitialViewportLoading(false);
        onLoad();
    };

    let initialScrollIndexParams;
    if (shouldFocusToTopOnMount) {
        initialScrollIndexParams = {viewOffset: windowHeight};
    } else if (initialScrollIndexViewOffset === undefined) {
        initialScrollIndexParams = undefined;
    } else {
        initialScrollIndexParams = {viewOffset: initialScrollIndexViewOffset};
    }

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
    };
}

export default useVerticallyCenteredInitialContent;

export type {InitialViewportRange};
