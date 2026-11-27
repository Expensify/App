import {renderHook} from '@testing-library/react-native';

import type UsePinnedScrollVariables from '@components/Search/hooks/usePinnedScrollVariables';
import {STICKY_HEADER_HEIGHT_VARIABLE} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';

import type {RefObject} from 'react';
import type {View} from 'react-native';

// Jest resolves the native no-op, so the web hook is loaded by its file name.
const {default: usePinnedScrollVariables} = jest.requireActual<{default: typeof UsePinnedScrollVariables}>('@components/Search/hooks/usePinnedScrollVariables/index.ts');

/** Records what the hook observes and lets a test fire the callback a resize would. */
class MockResizeObserver {
    static instances: MockResizeObserver[] = [];

    readonly callback: () => void;

    readonly observed: Element[] = [];

    readonly disconnect = jest.fn();

    constructor(callback: () => void) {
        this.callback = callback;
        MockResizeObserver.instances.push(this);
    }

    observe(element: Element) {
        this.observed.push(element);
    }
}

const HEADER_HEIGHT = 37;

function setProperty(element: HTMLElement, key: string, value: unknown) {
    Object.defineProperty(element, key, {value, configurable: true, writable: true});
}

/** A scroller holding the column header row, inside the view around the list. jsdom has no layout, so the header reports its height. */
function buildTable() {
    const container = document.createElement('div');
    const scroller = document.createElement('div');
    scroller.dataset.pinnedTableScroller = 'true';
    const headerRow = document.createElement('div');
    headerRow.dataset.pinnedHeaderRow = 'true';
    scroller.append(headerRow);
    container.append(scroller);
    document.body.append(container);

    const setHeaderHeight = (height: number) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only `height` is read from the header's rect
        setProperty(headerRow, 'getBoundingClientRect', () => ({height}) as DOMRect);
    };
    setHeaderHeight(HEADER_HEIGHT);

    // The hook reads the DOM node behind the ref, which is what react-native-web hands it on web.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a DOM node stands in for the react-native-web View
    const containerRef = {current: container as unknown as View} as RefObject<View | null>;

    return {container, headerRow, containerRef, setHeaderHeight};
}

function readVariable(element: HTMLElement, name: string) {
    return element.style.getPropertyValue(name);
}

describe('usePinnedScrollVariables', () => {
    beforeAll(() => {
        Object.defineProperty(global, 'ResizeObserver', {value: MockResizeObserver, writable: true});
    });

    beforeEach(() => {
        MockResizeObserver.instances = [];
        document.body.innerHTML = '';
    });

    it("publishes the sticky column header's height, which focus scrolling clears", () => {
        // Given a list that scrolls both ways, with its column header stuck to the top of its scroller
        const {container, containerRef} = buildTable();

        // When the hook runs for it
        renderHook(() => usePinnedScrollVariables(containerRef, true));

        // Then the header's height is on the view around the list, where every row's focus scrolling reads it
        expect(readVariable(container, STICKY_HEADER_HEIGHT_VARIABLE)).toBe(`${HEADER_HEIGHT}px`);
    });

    it('re-measures the header when it changes size', () => {
        // Given a list whose header height has been published
        const {container, headerRow, containerRef, setHeaderHeight} = buildTable();
        renderHook(() => usePinnedScrollVariables(containerRef, true));
        const resizeObserver = MockResizeObserver.instances.at(0);

        // When the header grows, e.g. because a heading wraps, which fires no scroll event
        setHeaderHeight(52);
        resizeObserver?.callback();

        // Then the published height follows it
        expect(resizeObserver?.observed).toContain(headerRow);
        expect(readVariable(container, STICKY_HEADER_HEIGHT_VARIABLE)).toBe('52px');
    });

    it('measures nothing for a list that only scrolls vertically', () => {
        // Given a list whose table an outer ScrollView scrolls sideways, so its header sits above the rows rather than over them
        const {container, containerRef} = buildTable();

        // When the hook runs for it
        renderHook(() => usePinnedScrollVariables(containerRef, false));

        // Then nothing is published or observed, so such lists pay nothing
        expect(readVariable(container, STICKY_HEADER_HEIGHT_VARIABLE)).toBe('');
        expect(MockResizeObserver.instances).toHaveLength(0);
    });

    it('stops observing once the table unmounts', () => {
        // Given a list with its header measured
        const {containerRef} = buildTable();
        const {unmount} = renderHook(() => usePinnedScrollVariables(containerRef, true));

        // When it unmounts
        unmount();

        // Then the resize observer is released, so a closed table leaks no work
        expect(MockResizeObserver.instances.at(0)?.disconnect).toHaveBeenCalled();
    });
});
