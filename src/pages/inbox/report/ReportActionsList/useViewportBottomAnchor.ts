/**
 * Keeps the content at the bottom edge of the report-actions list in place when the list viewport changes height,
 * for example when the keyboard opens or the composer grows. Content size changes are not handled here.
 */
import type * as OnyxTypes from '@src/types/onyx';

import type {LegendListRef} from '@legendapp/list/react-native';
import type {RefObject} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {useEffect, useRef} from 'react';

import {getReportActionKey} from './reportActionListUtils';

// Native reports a viewport correction within a few frames. Scroll events deferred while waiting for it are
// replayed after this delay, so a correction that native never reports cannot hold them back for longer.
const VIEWPORT_CORRECTION_SETTLE_DELAY = 200;

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

/** The content at the bottom edge of the list, kept in place when the viewport changes height. */
type ViewportAnchor = {
    height: number;
    bottom: number;

    /** A row near the bottom edge and its position when the bottom was recorded. */
    rowKey?: string;
    rowTop?: number;

    /** Set from a resize correction until native reports it, because earlier keyboard frames can still arrive. */
    awaitingScroll?: boolean;
};

type UseViewportBottomAnchorParams = {
    legendListRef: RefObject<LegendListRef | null>;

    /** The rows LegendList renders, used to find the row at the bottom edge. */
    listData: OnyxTypes.ReportAction[];

    /** Changes when LegendList remounts, which starts over without an anchor. */
    listID: string;
};

function useViewportBottomAnchor({legendListRef, listData, listID}: UseViewportBottomAnchorParams) {
    const viewportAnchorRef = useRef<ViewportAnchor | undefined>(undefined);
    const viewportCorrectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const deferredScrollEventRef = useRef<ScrollEvent | undefined>(undefined);

    useEffect(
        () => () => {
            // A remounted list must not wait for, or replay, scroll events of the list it replaces.
            clearTimeout(viewportCorrectionTimeoutRef.current);
            viewportCorrectionTimeoutRef.current = undefined;
            deferredScrollEventRef.current = undefined;
            viewportAnchorRef.current = undefined;
        },
        [listID],
    );

    const recordViewportBottom = (height: number, bottom: number, awaitingScroll = false) => {
        const state = legendListRef.current?.getState();
        const anchorRow = state ? listData.at(state.end) : undefined;
        const rowKey = anchorRow ? getReportActionKey(anchorRow) : undefined;
        viewportAnchorRef.current = {height, bottom, rowKey, rowTop: rowKey === undefined ? undefined : state?.positionByKey(rowKey), awaitingScroll};
    };

    // Rows above the bottom edge can be measured after the bottom was recorded, without a scroll event reaching
    // this hook first. LegendList keeps the visible rows in place by moving the offset, so follow that row.
    const getAnchoredViewportBottom = (viewport: ViewportAnchor) => {
        const rowTop = viewport.rowKey === undefined ? undefined : legendListRef.current?.getState()?.positionByKey(viewport.rowKey);
        return rowTop === undefined || viewport.rowTop === undefined ? viewport.bottom : viewport.bottom + rowTop - viewport.rowTop;
    };

    /** Stops waiting for native to report a correction, for example because the reader starts dragging. */
    const finishViewportCorrection = () => {
        clearTimeout(viewportCorrectionTimeoutRef.current);
        viewportCorrectionTimeoutRef.current = undefined;
        deferredScrollEventRef.current = undefined;
        if (viewportAnchorRef.current) {
            viewportAnchorRef.current.awaitingScroll = false;
        }
    };

    /** Anchors the current bottom edge once LegendList has positioned the list. */
    const startViewportAnchor = () => {
        const state = legendListRef.current?.getState();
        viewportAnchorRef.current = undefined;
        if (state) {
            recordViewportBottom(state.scrollLength, state.scroll + state.scrollLength);
        }
    };

    /**
     * Records the bottom edge a scroll event reports. Returns true when the event must not be processed yet, because
     * native has not reported a pending correction.
     */
    const deferScrollUntilViewportCorrected = (event: ScrollEvent) => {
        const {contentOffset, layoutMeasurement} = event.nativeEvent;
        const viewport = viewportAnchorRef.current;
        const bottom = contentOffset.y + layoutMeasurement.height;
        // A native scroll event can describe the next keyboard frame before its layout callback arrives, and web
        // reports an integer viewport height for a fractional layout height.
        const matchesViewport = !!viewport && Math.abs(viewport.height - layoutMeasurement.height) < 1;
        if (viewport?.awaitingScroll) {
            const isCorrectionReported = matchesViewport && Math.abs(bottom - getAnchoredViewportBottom(viewport)) <= 1;
            if (!isCorrectionReported) {
                // Until then, native can report offsets from earlier keyboard frames. The newest event is replayed
                // if the correction is never reported, so nothing it carries is lost.
                deferredScrollEventRef.current = event;
                return true;
            }
            finishViewportCorrection();
        }
        if (matchesViewport) {
            recordViewportBottom(viewport.height, bottom);
        }
        return false;
    };

    /**
     * Scrolls so the anchored content stays at the bottom edge of a viewport that changed height. Returns the new
     * distance from the end of the list, or undefined when the viewport kept its height.
     */
    const preserveViewportBottom = (height: number, replayScrollEvent: (event: ScrollEvent) => void) => {
        const state = legendListRef.current?.getState();
        const viewport = viewportAnchorRef.current;
        const isSameViewportHeight = !viewport || Math.abs(height - viewport.height) < 1;
        if (!state || !viewport || height <= 0 || isSameViewportHeight) {
            return undefined;
        }

        const maxOffset = Math.max(0, state.contentLength - height);
        const offset = Math.max(0, Math.min(getAnchoredViewportBottom(viewport) - height, maxOffset));
        const shouldCorrectOffset = offset !== state.scroll;
        // Consecutive keyboard frames can arrive before native scrolling reports the previous correction.
        recordViewportBottom(height, offset + height, shouldCorrectOffset || !!viewport.awaitingScroll);
        if (shouldCorrectOffset) {
            clearTimeout(viewportCorrectionTimeoutRef.current);
            viewportCorrectionTimeoutRef.current = setTimeout(() => {
                const deferredScrollEvent = deferredScrollEventRef.current;
                finishViewportCorrection();
                if (deferredScrollEvent) {
                    replayScrollEvent(deferredScrollEvent);
                }
            }, VIEWPORT_CORRECTION_SETTLE_DELAY);
            legendListRef.current?.scrollToOffset({offset, animated: false});
        }
        return maxOffset - offset;
    };

    return {startViewportAnchor, deferScrollUntilViewportCorrected, finishViewportCorrection, preserveViewportBottom};
}

export default useViewportBottomAnchor;
