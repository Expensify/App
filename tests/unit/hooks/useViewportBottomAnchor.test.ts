import {act, render, renderHook, screen} from '@testing-library/react-native';

import renderBottomPinnedScrollView from '@pages/inbox/report/ReportActionsList/BottomPinnedScrollView';
// Jest resolves this hook to its native file anyway. The explicit path keeps these tests on it.
import useViewportBottomAnchor from '@pages/inbox/report/ReportActionsList/useViewportBottomAnchor/index.native';

import type {LegendListRef} from '@legendapp/list/react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import createMock from '../../utils/createMock';

jest.unmock('@components/ActionSheetAwareScrollView');

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

const VIEWPORT_SETTLE_DELAY = 100;

const createLayoutEvent = (height: number) => createMock<LayoutChangeEvent>({nativeEvent: {layout: {x: 0, y: 0, width: 300, height}}, persist: jest.fn()});

const createScrollEvent = ({offset, contentHeight, viewportHeight}: {offset: number; contentHeight: number; viewportHeight: number}) =>
    createMock<ScrollEvent>({
        nativeEvent: {
            contentOffset: {x: 0, y: offset},
            contentSize: {height: contentHeight, width: 300},
            layoutMeasurement: {height: viewportHeight, width: 300},
        },
    });

/**
 * Renders the hook with a list that behaves like LegendList where the hook depends on it: it lays out for the
 * viewport it is told about, pads content that is shorter than the viewport, and then calls the list's own layout
 * callback, which asks the hook to preserve the bottom.
 */
function renderViewportBottomAnchor({
    offset,
    viewportHeight,
    rowsHeight,
    shouldBeAlignedToTop = false,
}: {
    offset: number;
    viewportHeight: number;
    rowsHeight: number;
    shouldBeAlignedToTop?: boolean;
}) {
    const listState = {scroll: offset, scrollLength: viewportHeight, contentLength: Math.max(rowsHeight, viewportHeight)};
    let scrollOffsetShift = 0;
    const scrollToOffset = jest.fn();
    const legendListRef = {
        current: createMock<LegendListRef>({
            getState: () => createMock<ReturnType<LegendListRef['getState']>>(listState),
            scrollToOffset,
            setVisibleContentAnchorOffset: (value) => {
                scrollOffsetShift = typeof value === 'function' ? value(scrollOffsetShift) : value;
            },
        }),
    };
    const initialProps: {listID: string; alignToTop?: boolean} = {listID: 'list', alignToTop: shouldBeAlignedToTop};
    const hook = renderHook(
        ({listID, alignToTop = shouldBeAlignedToTop}: typeof initialProps) => useViewportBottomAnchor({legendListRef, listData: [], listID, shouldBeAlignedToTop: alignToTop}),
        {
            initialProps,
        },
    );

    let distanceFromEnd: number | undefined;
    const layOutList = jest.fn((event: LayoutChangeEvent) => {
        listState.scrollLength = event.nativeEvent.layout.height;
        listState.contentLength = Math.max(rowsHeight, listState.scrollLength);
        distanceFromEnd = hook.result.current.preserveViewportBottom(listState.scrollLength, jest.fn());
    });
    const trackListScroll = jest.fn<void, [ScrollEvent]>();
    const getScrollView = () => {
        const scrollView = hook.result.current.renderScrollComponent?.({onLayout: layOutList, onScroll: trackListScroll});
        // The element is the bottom-pinned scroll view, whose props carry the height the hook gives it.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return scrollView?.props as {height: number | undefined; raisedBy: number; onLayout: (event: LayoutChangeEvent) => void; onScroll: (event: ScrollEvent) => void};
    };

    return {
        hook,
        listState,
        scrollToOffset,
        layOutList,
        trackListScroll,
        getScrollView,
        getScrollOffsetShift: () => scrollOffsetShift,
        getDistanceFromEnd: () => distanceFromEnd,
        resizeContainer: (height: number) => act(() => getScrollView().onLayout(createLayoutEvent(height))),
        settleContainer: () => act(() => jest.advanceTimersByTime(VIEWPORT_SETTLE_DELAY)),
    };
}

describe('useViewportBottomAnchor on iOS and Android', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('keeps the native scroll view at its measured height while the viewport shrinks', () => {
        // Given a chat that fills its viewport before the first measurement.
        const scrollView = (height: number | undefined, raisedBy: number) => renderBottomPinnedScrollView({height, raisedBy, testID: 'chat-scroll'});
        const {rerender, root} = render(scrollView(undefined, 0));
        expect(screen.getByTestId('chat-scroll')).toHaveStyle({height: '100%', bottom: 0});

        // When the composer rises, the fixed-height scroll view moves with its bottom edge.
        rerender(scrollView(500, 120));

        // Then its rows keep their measured height and the visible container clips the overflow.
        expect(screen.getByTestId('chat-scroll')).toHaveStyle({height: 500, bottom: 120, overflow: 'visible'});
        expect(root).toHaveStyle({overflow: 'hidden'});
    });

    it('lets the scroll view fill its container until the list is positioned', () => {
        // Given a list that is still doing its initial layout.
        const {getScrollView, resizeContainer, layOutList, getScrollOffsetShift} = renderViewportBottomAnchor({offset: 1500, viewportHeight: 500, rowsHeight: 2000});

        // When the container reports a new height.
        resizeContainer(400);

        // Then the list hears about it right away and positions itself, because nothing is anchored yet.
        expect(layOutList).toHaveBeenCalledTimes(1);
        expect(getScrollView()).toMatchObject({height: undefined, raisedBy: 0});
        expect(getScrollOffsetShift()).toBe(0);
    });

    it('moves the offset with the height when the keyboard shrinks the container', () => {
        // Given a positioned list whose reader is 600 pixels above the end.
        const {hook, getScrollView, resizeContainer, settleContainer, getScrollOffsetShift, getDistanceFromEnd} = renderViewportBottomAnchor({
            offset: 900,
            viewportHeight: 500,
            rowsHeight: 2000,
        });
        act(() => hook.result.current.startViewportAnchor());
        expect(getScrollView()).toMatchObject({height: 500, raisedBy: 0});

        // When the keyboard takes 300 pixels of the container and the container has settled.
        resizeContainer(200);
        settleContainer();

        // Then the scroll view takes the new height and its offset moves by the same 300 pixels, so the row at the
        // bottom edge stays there and the reader is still 600 pixels above the end.
        expect(getScrollView()).toMatchObject({height: 200, raisedBy: 0});
        expect(getScrollOffsetShift()).toBe(300);
        expect(getDistanceFromEnd()).toBe(600);
    });

    it('resizes the scroll view once for a container that changes on every frame', () => {
        // Given a positioned list and a keyboard animation that resizes the container frame by frame.
        const {hook, layOutList, resizeContainer, settleContainer} = renderViewportBottomAnchor({offset: 900, viewportHeight: 500, rowsHeight: 2000});
        act(() => hook.result.current.startViewportAnchor());

        // When the frames arrive closer together than the settle delay.
        for (const height of [400, 300, 200]) {
            resizeContainer(height);
            act(() => jest.advanceTimersByTime(VIEWPORT_SETTLE_DELAY / 2));
            expect(layOutList).not.toHaveBeenCalled();
        }
        settleContainer();

        // Then the list is laid out once, for the last height. The pinned scroll view kept the rows in place meanwhile.
        expect(layOutList).toHaveBeenCalledTimes(1);
        expect(layOutList.mock.calls.at(0)?.at(0)?.nativeEvent.layout.height).toBe(200);
    });

    it('grows the scroll view in the same update when its offset fits the new height', () => {
        // Given a reader far above the end while the keyboard is open.
        const {hook, getScrollView, resizeContainer, settleContainer, getScrollOffsetShift} = renderViewportBottomAnchor({offset: 900, viewportHeight: 200, rowsHeight: 2000});
        act(() => hook.result.current.startViewportAnchor());

        // When the keyboard closes and gives the container 300 pixels back.
        resizeContainer(500);
        settleContainer();

        // Then the scroll view grows at once and its offset moves back by 300 pixels, which is still within its range.
        expect(getScrollView()).toMatchObject({height: 500, raisedBy: 0});
        expect(getScrollOffsetShift()).toBe(-300);
    });

    it('raises the scroll view before it grows at the end of the list', () => {
        // Given a reader at the end of the list while the keyboard is open.
        const {hook, getScrollView, resizeContainer, settleContainer, getScrollOffsetShift, trackListScroll} = renderViewportBottomAnchor({
            offset: 1800,
            viewportHeight: 200,
            rowsHeight: 2000,
        });
        act(() => hook.result.current.startViewportAnchor());

        // When the keyboard closes. A scroll view that grew now would have its offset past its new end, and the
        // platform would move that offset as well.
        resizeContainer(500);
        settleContainer();

        // Then the scroll view keeps its height and moves up by the 300 pixels instead, while its offset moves back.
        expect(getScrollView()).toMatchObject({height: 200, raisedBy: 300});
        expect(getScrollOffsetShift()).toBe(-300);

        // When a scroll event still reports the old offset, which does not fit the grown scroll view.
        act(() => getScrollView().onScroll(createScrollEvent({offset: 1800, contentHeight: 2000, viewportHeight: 200})));

        // Then the scroll view stays raised, and the list sees the viewport height it has already laid out for.
        expect(getScrollView()).toMatchObject({height: 200, raisedBy: 300});
        expect(trackListScroll.mock.calls.at(-1)?.at(0)?.nativeEvent.layoutMeasurement.height).toBe(500);

        // When the scroll event with the moved offset arrives.
        act(() => getScrollView().onScroll(createScrollEvent({offset: 1500, contentHeight: 2000, viewportHeight: 200})));

        // Then the scroll view grows down to the bottom of its container.
        expect(getScrollView()).toMatchObject({height: 500, raisedBy: 0});
        expect(trackListScroll.mock.calls.at(-1)?.at(0)?.nativeEvent).toMatchObject({contentOffset: {y: 1500}, layoutMeasurement: {height: 500}});
    });

    it('returns to the top when the rows fit the grown viewport', () => {
        // Given 400 pixels of rows, scrolled to their end in a 200 pixel viewport.
        const {hook, getScrollView, resizeContainer, settleContainer, getScrollOffsetShift, getDistanceFromEnd} = renderViewportBottomAnchor({
            offset: 200,
            viewportHeight: 200,
            rowsHeight: 400,
        });
        act(() => hook.result.current.startViewportAnchor());

        // When the container grows to 500 pixels, so the list pads the rows down to its end.
        resizeContainer(500);
        settleContainer();

        // Then the offset returns to 0, where the padded rows sit at the bottom edge as before.
        expect(getScrollOffsetShift()).toBe(-200);
        expect(getDistanceFromEnd()).toBe(0);
        expect(getScrollView()).toMatchObject({height: 200, raisedBy: 300});
    });

    it('leaves the scroll view alone when the container returns to its height before it settles', () => {
        // Given a positioned list.
        const {hook, getScrollView, resizeContainer, settleContainer, getScrollOffsetShift, getDistanceFromEnd} = renderViewportBottomAnchor({
            offset: 900,
            viewportHeight: 500,
            rowsHeight: 2000,
        });
        act(() => hook.result.current.startViewportAnchor());

        // When the container shrinks and grows back within the settle delay.
        resizeContainer(200);
        resizeContainer(500);
        settleContainer();

        // Then nothing is resized or scrolled.
        expect(getScrollView()).toMatchObject({height: 500, raisedBy: 0});
        expect(getScrollOffsetShift()).toBe(0);
        expect(getDistanceFromEnd()).toBeUndefined();
    });

    it('scrolls a list aligned to the top instead of pinning its scroll view', () => {
        // Given an expense thread, whose rows start at the top edge, with a reader 600 pixels above the end.
        const {hook, scrollToOffset, getScrollView, getScrollOffsetShift} = renderViewportBottomAnchor({offset: 900, viewportHeight: 500, rowsHeight: 2000, shouldBeAlignedToTop: true});
        act(() => hook.result.current.startViewportAnchor());

        // When the keyboard takes 300 pixels of the viewport.
        let distanceFromEnd: number | undefined;
        act(() => {
            distanceFromEnd = hook.result.current.preserveViewportBottom(200, jest.fn());
        });

        // Then the list scrolls by those 300 pixels. A scroll view pinned to the bottom would move rows that still fit
        // away from the top edge while the keyboard animates, so these lists render the scroll view that fills them.
        expect(scrollToOffset).toHaveBeenCalledWith({offset: 1200, animated: false});
        expect(distanceFromEnd).toBe(600);
        expect(getScrollOffsetShift()).toBe(0);
        expect(getScrollView()).toMatchObject({height: undefined, raisedBy: 0});
    });

    it('keeps the same scroll view and anchors its current position when the parent action changes alignment', () => {
        // Given a positioned report whose parent action has not identified it as an expense thread yet.
        const {hook, listState, getScrollView, resizeContainer, settleContainer, scrollToOffset, getScrollOffsetShift} = renderViewportBottomAnchor({
            offset: 900,
            viewportHeight: 500,
            rowsHeight: 2000,
        });
        act(() => hook.result.current.startViewportAnchor());
        const initialScrollViewType = hook.result.current.renderScrollComponent?.({})?.type;

        // When the parent action loads after the reader has scrolled, the list receives no second ready event.
        listState.scroll = 700;
        hook.rerender({listID: 'list', alignToTop: true});

        // Then the native scroll view stays mounted at its offset. The next layout corrects from that position.
        expect(hook.result.current.renderScrollComponent?.({})?.type).toBe(initialScrollViewType);
        expect(scrollToOffset).not.toHaveBeenCalled();
        expect(getScrollOffsetShift()).toBe(0);
        resizeContainer(400);
        expect(scrollToOffset).toHaveBeenCalledWith({offset: 800, animated: false});

        // When the report returns to end alignment after another scroll, it pins the current viewport immediately.
        listState.scroll = 650;
        hook.rerender({listID: 'list', alignToTop: false});

        // Then switching keeps the same scroll view and offset, and the next keyboard frame preserves the bottom.
        expect(hook.result.current.renderScrollComponent?.({})?.type).toBe(initialScrollViewType);
        expect(getScrollView()).toMatchObject({height: 400, raisedBy: 0});
        expect(getScrollOffsetShift()).toBe(0);
        resizeContainer(300);
        settleContainer();
        expect(getScrollOffsetShift()).toBe(100);
    });

    it('drops a pending resize when the list remounts', () => {
        // Given a positioned list whose container just changed height.
        const {hook, layOutList, resizeContainer, settleContainer} = renderViewportBottomAnchor({offset: 900, viewportHeight: 500, rowsHeight: 2000});
        act(() => hook.result.current.startViewportAnchor());
        resizeContainer(200);

        // When the hydrated report remounts the list before the container has settled.
        hook.rerender({listID: 'hydrated list'});
        settleContainer();

        // Then the new list is not laid out for the container of the list it replaced.
        expect(layOutList).not.toHaveBeenCalled();
    });
});
