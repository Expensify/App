/**
 * Keeps the content at the bottom edge of an end-aligned report-actions list in place when the list viewport changes
 * height, for example when the keyboard opens or the composer grows. Content size changes are not handled here.
 *
 * The scroll view is pinned to the bottom of a clipping container, keeps its own height and draws its rows outside
 * its bounds. A container that changes height moves the scroll view as a whole in the same native frame, so the
 * rows at the bottom edge do not wait for JS. Once the container has settled, the scroll view takes its height and
 * its offset moves by the difference in one native update, which does not move the rows either.
 */
import type {ActionSheetAwareScrollViewProps} from '@components/ActionSheetAwareScrollView/types';

import renderBottomPinnedScrollView from '@pages/inbox/report/ReportActionsList/BottomPinnedScrollView';

import type {LayoutChangeEvent} from 'react-native';

import {useEffect, useRef, useState} from 'react';

import type {ScrollEvent, UseViewportBottomAnchorParams, ViewportBottomAnchor} from './types';

// A keyboard animation resizes the container on every frame. The rows are already in place while it runs, so the
// scroll view is only resized once no new height has arrived for this long.
const VIEWPORT_SETTLE_DELAY = 100;

/** The scroll view's own height, and how far its bottom edge sits above the bottom edge of the container. */
type PinnedScrollView = {
    listID: string;
    height: number;
    raisedBy: number;
};

type UseBottomPinnedScrollViewParams = Pick<UseViewportBottomAnchorParams, 'legendListRef' | 'listID'>;

function useBottomPinnedScrollView({
    legendListRef,
    listID,
}: UseBottomPinnedScrollViewParams): Pick<ViewportBottomAnchor, 'startViewportAnchor' | 'preserveViewportBottom' | 'renderScrollComponent'> & {flushPendingViewportLayout: () => void} {
    const [renderedScrollView, setRenderedScrollView] = useState<PinnedScrollView>();
    const scrollView = renderedScrollView?.listID === listID ? renderedScrollView : undefined;
    // Layout and scroll events can arrive before the next render, so their handlers read what was set last.
    const scrollViewRef = useRef<PinnedScrollView | undefined>(undefined);
    const viewportSettleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const pendingViewportLayoutRef = useRef<(() => void) | undefined>(undefined);
    const offsetBeforeResizeRef = useRef<number | undefined>(undefined);

    const getPinnedScrollView = () => (scrollViewRef.current?.listID === listID ? scrollViewRef.current : undefined);
    const pinScrollView = (height: number, raisedBy: number) => {
        scrollViewRef.current = {listID, height, raisedBy};
        setRenderedScrollView(scrollViewRef.current);
    };

    useEffect(
        () => () => {
            // A remounted list must not be laid out for the container of the list it replaces.
            clearTimeout(viewportSettleTimeoutRef.current);
            pendingViewportLayoutRef.current = undefined;
        },
        [listID],
    );

    /** Gives the scroll view its own height once LegendList has positioned the list. */
    const startViewportAnchor = () => {
        const height = legendListRef.current?.getState()?.scrollLength;
        if (height) {
            pinScrollView(height, 0);
        }
    };

    /**
     * Resizes the scroll view to a container that changed height and moves its offset so the same content stays at
     * the bottom edge. Returns the new distance from the end of the list, or undefined when nothing changed.
     */
    const preserveViewportBottom = (height: number) => {
        const pinnedScrollView = getPinnedScrollView();
        const offsetBeforeResize = offsetBeforeResizeRef.current;
        if (!pinnedScrollView || offsetBeforeResize === undefined || height <= 0) {
            return undefined;
        }
        const previousHeight = pinnedScrollView.height + pinnedScrollView.raisedBy;
        const state = legendListRef.current?.getState();
        if (!state || height === previousHeight) {
            return undefined;
        }

        // LegendList has laid out for the new height by now, so content that fits in it is already padded to the end.
        const maxOffset = Math.max(0, state.contentLength - height);
        const previousEndPadding = Math.max(0, previousHeight - state.contentLength);
        const offset = maxOffset > 0 ? Math.max(0, Math.min(offsetBeforeResize + previousHeight - height - previousEndPadding, maxOffset)) : 0;

        // The anchor moves the native offset after the scroll view is laid out, in the same native update.
        legendListRef.current?.setVisibleContentAnchorOffset((anchorOffset) => anchorOffset + offset - offsetBeforeResize);

        // A scroll view that grows while its offset is past its new end has that offset moved by the platform too,
        // before or after the anchor moves it. It is raised by the missing height instead, and grows once its offset fits.
        const isOffsetPastNewEnd = offsetBeforeResize > maxOffset + 1;
        const scrollViewHeight = isOffsetPastNewEnd ? Math.min(pinnedScrollView.height, height) : height;
        pinScrollView(scrollViewHeight, height - scrollViewHeight);
        return maxOffset - offset;
    };

    const flushPendingViewportLayout = () => {
        clearTimeout(viewportSettleTimeoutRef.current);
        const pendingLayout = pendingViewportLayoutRef.current;
        pendingViewportLayoutRef.current = undefined;
        pendingLayout?.();
    };

    /** Reports the container size to LegendList once it has settled. LegendList then lays out for it and calls `preserveViewportBottom`. */
    const layOutSettledViewport = (event: LayoutChangeEvent, layOutList: ActionSheetAwareScrollViewProps['onLayout']) => {
        clearTimeout(viewportSettleTimeoutRef.current);
        if (!getPinnedScrollView()) {
            layOutList?.(event);
            return;
        }
        // React clears a layout event once its handler returns.
        event.persist();
        pendingViewportLayoutRef.current = () => {
            // LegendList can move its recorded offset while it lays out for a new viewport, so read it first.
            offsetBeforeResizeRef.current = legendListRef.current?.getState()?.scroll;
            layOutList?.(event);
            offsetBeforeResizeRef.current = undefined;
        };
        viewportSettleTimeoutRef.current = setTimeout(flushPendingViewportLayout, VIEWPORT_SETTLE_DELAY);
    };

    /** Reports the scroll events of a raised scroll view with the height it is about to take, and lets it take that height once its offset fits. */
    const trackRaisedScrollViewScroll = (event: ScrollEvent, trackListScroll: ActionSheetAwareScrollViewProps['onScroll']) => {
        const pinnedScrollView = getPinnedScrollView();
        if (!pinnedScrollView || pinnedScrollView.raisedBy === 0) {
            trackListScroll?.(event);
            return;
        }
        const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
        const height = pinnedScrollView.height + pinnedScrollView.raisedBy;
        const doesOffsetFit = contentOffset.y <= Math.max(0, contentSize.height - height) + 1;
        if (doesOffsetFit) {
            pinScrollView(height, 0);
        }
        trackListScroll?.({...event, nativeEvent: {...event.nativeEvent, layoutMeasurement: {...layoutMeasurement, height}}});
    };

    const renderScrollComponent = (props: ActionSheetAwareScrollViewProps) =>
        renderBottomPinnedScrollView({
            ...props,
            onLayout: (event) => layOutSettledViewport(event, props.onLayout),
            onScroll: (event) => trackRaisedScrollViewScroll(event, props.onScroll),
            height: scrollView?.height,
            raisedBy: scrollView?.raisedBy ?? 0,
        });

    return {startViewportAnchor, preserveViewportBottom, renderScrollComponent, flushPendingViewportLayout};
}

export default useBottomPinnedScrollView;
