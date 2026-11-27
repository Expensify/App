import {renderHook} from '@testing-library/react-native';

import type UseTableScrollOffset from '@components/Search/hooks/useTableScrollOffset';
import type HorizontalScrollOffsetStore from '@components/Search/hooks/useTableScrollOffset/types';

import type {RefObject} from 'react';
import type {View} from 'react-native';

// Jest resolves the native no-op, so the web hook is loaded by its file name.
const {default: useTableScrollOffset} = jest.requireActual<{default: typeof UseTableScrollOffset}>('@components/Search/hooks/useTableScrollOffset/index.ts');

type ScrollToOptions = {x?: number; y?: number; animated?: boolean};

function setProperty(element: HTMLElement, key: string, value: unknown) {
    Object.defineProperty(element, key, {value, configurable: true, writable: true});
}

/**
 * A list scroller as react-native-web leaves it: its ScrollView's `scrollTo` and `scrollToEnd` sit on the element and scroll both axes
 * through the ScrollView's `scrollResponderScrollTo`, which they look up when they run, as FlashList's copies of them do.
 */
function buildList() {
    const container = document.createElement('div');
    const scroller = document.createElement('div');
    scroller.dataset.pinnedTableScroller = 'true';
    container.append(scroller);
    document.body.append(container);
    setProperty(scroller, 'scrollLeft', 0);
    setProperty(scroller, 'scrollTop', 0);
    const reactNativeWebScrollTo = jest.fn(({x = 0, y = 0}: ScrollToOptions = {}) => {
        setProperty(scroller, 'scrollLeft', x);
        setProperty(scroller, 'scrollTop', y);
    });
    const scrollResponder = {scrollResponderScrollTo: reactNativeWebScrollTo};
    setProperty(scroller, 'getScrollResponder', () => scrollResponder);
    setProperty(scroller, 'scrollTo', (options: ScrollToOptions) => scrollResponder.scrollResponderScrollTo({x: options.x ?? 0, y: options.y ?? 0, animated: options.animated}));
    setProperty(scroller, 'scrollToEnd', () => scrollResponder.scrollResponderScrollTo({x: 0, y: 5000}));

    // The hook reads the DOM node behind the ref, which is what react-native-web hands it on web.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a DOM node stands in for the react-native-web View
    const containerRef = {current: container as unknown as View} as RefObject<View | null>;
    return {scroller, containerRef, reactNativeWebScrollTo, scrollResponder};
}

function createOffsetStore(initialOffset = 0): HorizontalScrollOffsetStore & {offset: number} {
    const store = {
        offset: initialOffset,
        get: () => store.offset,
        set: (offset: number) => {
            store.offset = offset;
        },
    };
    return store;
}

function scrollSideways(scroller: HTMLElement, scrollLeft: number) {
    setProperty(scroller, 'scrollLeft', scrollLeft);
    scroller.dispatchEvent(new Event('scroll'));
}

function callScrollTo(scroller: HTMLElement, options: ScrollToOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- FlashList calls the react-native-web scrollTo on the element
    (scroller as unknown as {scrollTo: (scrollOptions: ScrollToOptions) => void}).scrollTo(options);
}

function callScrollToEnd(scroller: HTMLElement) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- FlashList calls the react-native-web scrollToEnd on the element
    (scroller as unknown as {scrollToEnd: () => void}).scrollToEnd();
}

describe('useTableScrollOffset', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('restores the offset a previous search left before paint, and keeps the offset each scroll reaches', () => {
        // Given a search that was scrolled 90px sideways before the query changed
        const {scroller, containerRef} = buildList();
        const offsetStore = createOffsetStore(90);

        // When the new results mount and are then scrolled further
        renderHook(() => useTableScrollOffset(containerRef, true, offsetStore, undefined));
        const restoredOffset = scroller.scrollLeft;
        scrollSideways(scroller, 130);

        // Then the table opens where it was left, and the next search will open where this one is left
        expect(restoredOffset).toBe(90);
        expect(offsetStore.offset).toBe(130);
    });

    it("keeps the table's sideways offset when the list scrolls itself vertically", () => {
        // Given a table scrolled 200px sideways, whose list then scrolls to a row, as FlashList does for the arrow keys
        const {scroller, containerRef, reactNativeWebScrollTo} = buildList();
        renderHook(() => useTableScrollOffset(containerRef, true, createOffsetStore(), undefined));
        scrollSideways(scroller, 200);

        // When FlashList asks for the row's vertical offset, with x: 0 as it always does for a vertical list
        callScrollTo(scroller, {x: 0, y: 480, animated: true});

        // Then the list moves down and the table stays on the columns the user scrolled to
        expect(reactNativeWebScrollTo).toHaveBeenCalledWith({x: 200, y: 480, animated: true});
        expect(scroller.scrollLeft).toBe(200);
        expect(scroller.scrollTop).toBe(480);
    });

    it("keeps the table's sideways offset when the list scrolls to its end", () => {
        // Given a table scrolled 200px sideways, whose list then scrolls to its end, as FlashList does when a scroll to a row runs out of rows
        const {scroller, containerRef} = buildList();
        renderHook(() => useTableScrollOffset(containerRef, true, createOffsetStore(), undefined));
        scrollSideways(scroller, 200);

        // When react-native-web's scrollToEnd runs, which skips the element's scrollTo
        callScrollToEnd(scroller);

        // Then the list reaches its end and the table stays on the same columns
        expect(scroller.scrollTop).toBe(5000);
        expect(scroller.scrollLeft).toBe(200);
    });

    it("puts react-native-web's scrolling back and stops keeping offsets once the table unmounts", () => {
        // Given a table that unmounts
        const {scroller, containerRef, reactNativeWebScrollTo, scrollResponder} = buildList();
        const offsetStore = createOffsetStore();
        const {unmount} = renderHook(() => useTableScrollOffset(containerRef, true, offsetStore, undefined));
        unmount();

        // When its scroller still scrolls, e.g. while it animates out
        scrollSideways(scroller, 300);

        // Then nothing is kept anymore and the ScrollView scrolls the way react-native-web made it to
        expect(offsetStore.offset).toBe(0);
        expect(scrollResponder.scrollResponderScrollTo).toBe(reactNativeWebScrollTo);
    });

    it('leaves a list that only scrolls vertically alone', () => {
        // Given a table scrolled by an outer horizontal ScrollView, whose own offset that ScrollView restores
        const {scroller, containerRef, reactNativeWebScrollTo, scrollResponder} = buildList();

        // When the hook runs for it with an offset kept from a previous search
        renderHook(() => useTableScrollOffset(containerRef, false, createOffsetStore(90), undefined));

        // Then its list's scroller is neither moved nor wrapped
        expect(scroller.scrollLeft).toBe(0);
        expect(scrollResponder.scrollResponderScrollTo).toBe(reactNativeWebScrollTo);
    });
});
