import {act, renderHook} from '@testing-library/react-native';

import {useRecyclerViewController} from '@shopify/flash-list/dist/recyclerview/hooks/useRecyclerViewController';

function renderShortListController() {
    // The hook uses only these manager methods in this test; the full manager requires layout setup.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const manager = {
        props: {horizontal: false, inverted: false},
        firstItemOffset: 0,
        hasLayout: () => true,
        getDataLength: () => 3,
        getLayout: (index: number) => ({x: 0, y: index * 40, width: 200, height: 40}),
        getWindowSize: () => ({width: 200, height: 400}),
        getAbsoluteLastScrollOffset: () => 0,
        getMaxScrollOffset: () => 0,
        setOffsetProjectionEnabled: jest.fn(),
        setScrollDirection: jest.fn(),
        updateScrollOffset: () => undefined,
    } as unknown as Parameters<typeof useRecyclerViewController>[0];
    const scrollTo = jest.fn();
    // The hook only calls scrollTo on this ref; no native ScrollView is mounted here.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const scrollViewRef = {current: {scrollTo}} as unknown as Parameters<typeof useRecyclerViewController>[2];
    const scrollAnchorRef: Parameters<typeof useRecyclerViewController>[3] = {current: {scrollBy: jest.fn()}};
    const {result} = renderHook(() => useRecyclerViewController(manager, null, scrollViewRef, scrollAnchorRef));
    return {result, scrollTo};
}

describe('FlashList programmatic scroll state', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('settles a non-animated scrollToIndex even when the list cannot scroll', async () => {
        // Given a short list whose requested index is already visible, so scrollTo does not emit a scroll event
        const {result, scrollTo} = renderShortListController();
        const afterScroll = jest.fn();

        // When an invited member is highlighted using a non-animated scrollToIndex
        await act(async () => {
            const scrollPromise = result.current.handlerMethods.scrollToIndex({index: 1, animated: false});
            result.current.runAfterProgrammaticScroll(afterScroll);
            jest.advanceTimersByTime(200);
            await scrollPromise;
        });

        // Then the sort is no longer blocked waiting for a scroll-end event that never occurs
        expect(scrollTo).toHaveBeenCalled();
        expect(result.current.isScrollingProgrammatically()).toBe(false);
        expect(afterScroll).toHaveBeenCalledTimes(1);
    });

    it('does not let an older non-animated request settle a newer animated scroll', async () => {
        // Given a short list with two overlapping programmatic scroll requests
        const {result} = renderShortListController();

        // When a non-animated request is followed by an animated request before the first completion timer fires
        await act(async () => {
            const firstScroll = result.current.handlerMethods.scrollToIndex({index: 1, animated: false});
            const secondScroll = result.current.handlerMethods.scrollToIndex({index: 2, animated: true});
            jest.advanceTimersByTime(200);
            await firstScroll;
            expect(result.current.isScrollingProgrammatically()).toBe(true);
            jest.advanceTimersByTime(100);
            await secondScroll;
        });

        // Then the newer animated request stays active until a scroll-end event settles it
        expect(result.current.isScrollingProgrammatically()).toBe(true);
        act(() => result.current.notifyProgrammaticScrollSettled());
        expect(result.current.isScrollingProgrammatically()).toBe(false);
    });
});
