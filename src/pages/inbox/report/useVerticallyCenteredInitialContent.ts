import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import useReportScrollManager from '@hooks/useReportScrollManager';
import usewindowdimensions from '@hooks/useWindowDimensions';
import type {FlashListRefType} from '@pages/inbox/ReportScreenContext';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const INITIAL_TARGET_REPORT_ACTION_ESTIMATED_HEIGHT = CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT;
const INITIAL_VIEWPORT_OVERSCAN_ITEMS = 2;

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
    const {windowHeight} = usewindowdimensions();

    const initialScrollIndex = !initialScrollKey ? -1 : sortedVisibleReportActions.findIndex((item) => keyExtractor(item) === initialScrollKey);
    const hasInitialScrollTarget = initialScrollIndex >= 0;
    const shouldMeasureLinkedAnchorScrollPosition = !!initialScrollKey && hasInitialScrollTarget;
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
    /** Linked deeplink opens need post-layout corrective scroll so the inverted anchor lands correctly; skips unread-only flows (mark unread). */
    const [hasAppliedMeasuredAnchorScroll, setHasAppliedMeasuredAnchorScroll] = useState(() => !shouldMeasureLinkedAnchorScrollPosition);
    /** Prevents repeated corrective scrollToIndex calls when onLayout repeats. */
    const hasCommittedMeasuredAnchorScrollRef = useRef(false);
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
        hasInitialScrollTarget && (isInitialViewportLoading || (shouldMeasureLinkedAnchorScrollPosition && !hasAppliedMeasuredAnchorScroll) || shouldAwaitLinkedOlderRevealWhileGateCold);

    const reportScrollManagerRefValue = reportScrollManager.ref as FlashListRefType;

    /** Correct inverted linked-message positioning using the laid-out row height (not needed for unread-anchor-only scroll). */
    const handleInitialScrollTargetLayout = (layoutHeight: number) => {
        if (!shouldMeasureLinkedAnchorScrollPosition || layoutHeight <= 0 || listHeight <= 0) {
            return;
        }

        if (hasCommittedMeasuredAnchorScrollRef.current) {
            return;
        }

        const flashListRef = reportScrollManagerRefValue?.current;
        if (!flashListRef?.scrollToIndex) {
            setHasAppliedMeasuredAnchorScroll(true);
            return;
        }

        hasCommittedMeasuredAnchorScrollRef.current = true;

        // Why offset shifts by measured height: `initialScrollIndex` + `-listHeight/2` aligns the flipped cell so the opposite vertical edge lands on mid-viewport.
        const viewOffsetAlignedToTopEdge = -listHeight / 2 + layoutHeight;

        requestAnimationFrame(() => {
            flashListRef
                .scrollToIndex({
                    index: initialScrollIndex,
                    animated: false,
                    viewOffset: viewOffsetAlignedToTopEdge,
                })
                .catch(() => {
                    // Rare failure (e.g. index not yet mapped); dropping the skeleton avoids a stuck overlay.
                })
                .finally(() => {
                    setHasAppliedMeasuredAnchorScroll(true);
                });
        });
    };

    useLayoutEffect(() => {
        const normalizedLinkedReportActionID = linkedReportActionID;
        const normalizedInitialScrollKey = initialScrollKey;
        const previousSession = initialViewportResetSessionRef.current;

        const isFirstViewportResetCycle = previousSession === undefined;
        const listIDBumped = isFirstViewportResetCycle ? true : previousSession.listID !== listID;
        const reportSwitched = isFirstViewportResetCycle ? true : previousSession.reportID !== report.reportID;
        const linkedTargetingChanged = isFirstViewportResetCycle ? false : previousSession.linkedReportActionID !== normalizedLinkedReportActionID;

        const hadScrollAnchor = !!previousSession?.initialScrollKey;
        const hasScrollAnchor = !!normalizedInitialScrollKey;

        const isUnreadMarkerOnlyShuffle =
            hasScrollAnchor &&
            hadScrollAnchor &&
            previousSession !== undefined &&
            previousSession.initialScrollKey !== normalizedInitialScrollKey &&
            !normalizedLinkedReportActionID &&
            !listIDBumped &&
            !reportSwitched &&
            !linkedTargetingChanged;

        initialViewportResetSessionRef.current = {
            listID,
            reportID: report.reportID,
            linkedReportActionID: normalizedLinkedReportActionID,
            initialScrollKey: normalizedInitialScrollKey,
        };

        if (isUnreadMarkerOnlyShuffle) {
            return;
        }

        const shouldDeferLinkedOlderReveal = !!(normalizedLinkedReportActionID && hasOlderActions);
        setLinkedOlderRevealGateReady(!shouldDeferLinkedOlderReveal);

        mountedInitialViewportIndicesRef.current.clear();
        hasInitialViewportLoadedRef.current = !hasInitialScrollTarget;
        hasCommittedMeasuredAnchorScrollRef.current = false;
        setHasAppliedMeasuredAnchorScroll(!shouldMeasureLinkedAnchorScrollPosition);
        setIsInitialViewportLoading(hasInitialScrollTarget);
    }, [hasInitialScrollTarget, hasOlderActions, initialScrollKey, linkedReportActionID, listID, report.reportID, shouldMeasureLinkedAnchorScrollPosition]);

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
    }, [hasAppliedMeasuredAnchorScroll, hasOlderActions, isInitialViewportLoading, linkedReportActionID, reportLoadingState?.isLoadingOlderReportActions]);

    useEffect(() => {
        if (!linkedReportActionID || !hasInitialScrollTarget || hasAppliedMeasuredAnchorScroll) {
            return undefined;
        }

        const fallbackTimer = setTimeout(() => {
            setHasAppliedMeasuredAnchorScroll(true);
        }, 3000);

        return () => {
            clearTimeout(fallbackTimer);
        };
    }, [hasAppliedMeasuredAnchorScroll, hasInitialScrollTarget, linkedReportActionID]);

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
        shouldRenderFlashList,
        shouldShowInitialViewportSkeleton,
    };
}

export default useVerticallyCenteredInitialContent;

export type {InitialViewportRange};
