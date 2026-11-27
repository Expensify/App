import {renderHook} from '@testing-library/react-native';

import type UsePinnedScrollVariables from '@components/Search/hooks/usePinnedScrollVariables';
import {
    getPinnedLeftVariable,
    PINNED_GUTTER_MASK_VISIBILITY_VARIABLE,
    PINNED_LEFT_EDGE_VARIABLE,
    PINNED_LEFT_LEAD_VARIABLE,
    PINNED_LINE_WIDTH_VARIABLE,
    PINNED_SCROLLBAR_HEIGHT_VARIABLE,
    PINNED_START_EDGE_OPACITY_VARIABLE,
    PINNED_START_WIDTH_VARIABLE,
    STICKY_HEADER_HEIGHT_VARIABLE,
} from '@components/Search/pinnedCellStyles/pinnedScrollVariables';
import type {SearchColumnType} from '@components/Search/types';

import CONST from '@src/CONST';

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

const PINNED_COLUMNS: SearchColumnType[] = [CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.TABLE_COLUMNS.MERCHANT];

const SCROLLER_LEFT = 100;
const ROW_EDGE = 20;
const ROW_PADDING = 12;
const HEADINGS_START = 64;
const COLUMN_GAP = 12;
const DATE_WIDTH = 100;
const MERCHANT_WIDTH = 150;
const HEADER_HEIGHT = 37;

function setProperty(element: HTMLElement, key: string, value: unknown) {
    Object.defineProperty(element, key, {value, configurable: true, writable: true});
}

/**
 * A scroller holding a header row whose headings are Date and Merchant, both pinned, then Category. jsdom has no layout, so every
 * box reports where it would be on screen given the scroller's offset, the way the browser would for boxes that don't stick.
 */
function buildTable() {
    const container = document.createElement('div');
    const scroller = document.createElement('div');
    scroller.dataset.pinnedTableScroller = 'true';
    const headerRow = document.createElement('div');
    headerRow.dataset.pinnedHeaderRow = 'true';
    const headingRow = document.createElement('div');
    const dateHeading = document.createElement('div');
    dateHeading.dataset.pinnedHeading = 'true';
    const merchantHeading = document.createElement('div');
    merchantHeading.dataset.pinnedHeading = 'true';
    const categoryHeading = document.createElement('div');
    headingRow.append(dateHeading, merchantHeading, categoryHeading);
    headerRow.append(headingRow);
    scroller.append(headerRow);
    container.append(scroller);
    document.body.append(container);

    setProperty(scroller, 'scrollLeft', 0);
    setProperty(scroller, 'clientWidth', 900);
    const setWidth = (element: HTMLElement, width: number) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only `width` is read from a heading's rect
        setProperty(element, 'getBoundingClientRect', () => ({width}) as DOMRect);
    };
    setWidth(dateHeading, DATE_WIDTH);
    setWidth(merchantHeading, MERCHANT_WIDTH);
    setWidth(categoryHeading, 200);
    const placeAt = (element: HTMLElement, contentLeft: number, height = 0, width = 0) => {
        const getRect = () => {
            const left = SCROLLER_LEFT + contentLeft - scroller.scrollLeft;
            return {left, right: left + width, width, height};
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only these fields are read from the rect
        setProperty(element, 'getBoundingClientRect', () => getRect() as DOMRect);
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only `left` is read from the rect
    setProperty(scroller, 'getBoundingClientRect', () => ({left: SCROLLER_LEFT}) as DOMRect);
    placeAt(headerRow, ROW_EDGE, HEADER_HEIGHT);
    placeAt(headingRow, HEADINGS_START);
    headerRow.style.paddingLeft = `${ROW_PADDING}px`;
    headingRow.dataset.columnGap = `${COLUMN_GAP}px`;

    // The hook reads the DOM node behind the ref, which is what react-native-web hands it on web.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a DOM node stands in for the react-native-web View
    const containerRef = {current: container as unknown as View} as RefObject<View | null>;

    return {container, scroller, merchantHeading, containerRef, setWidth};
}

function readVariable(element: HTMLElement, name: string) {
    return element.style.getPropertyValue(name);
}

function scrollTo(scroller: HTMLElement, scrollLeft: number) {
    setProperty(scroller, 'scrollLeft', scrollLeft);
    scroller.dispatchEvent(new Event('scroll'));
}

describe('usePinnedScrollVariables', () => {
    const getComputedStyleOriginal = window.getComputedStyle.bind(window);

    beforeAll(() => {
        Object.defineProperty(global, 'ResizeObserver', {value: MockResizeObserver, writable: true});
        // jsdom doesn't compute `column-gap`, so the heading row's gap is handed over through a data attribute.
        jest.spyOn(window, 'getComputedStyle').mockImplementation((element: Element) => {
            const style = getComputedStyleOriginal(element);
            const gap = element instanceof HTMLElement ? element.dataset.columnGap : undefined;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only paddingLeft and columnGap are read
            return gap ? ({paddingLeft: style.paddingLeft, columnGap: gap} as CSSStyleDeclaration) : style;
        });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        MockResizeObserver.instances = [];
        document.body.innerHTML = '';
    });

    it('measures where each pinned box rests, so its sticky inset matches it and it never moves', () => {
        // Given a table that scrolls both ways with Date and Merchant pinned left
        const {container, containerRef} = buildTable();

        // When the hook runs for it
        renderHook(() => usePinnedScrollVariables(containerRef, true, PINNED_COLUMNS));

        // Then the rows' edge, the content start and each pin's resting offset are published, and the cover spans the pins and the
        // gap after them
        const merchantLeft = HEADINGS_START + DATE_WIDTH + COLUMN_GAP;
        const regionEnd = merchantLeft + MERCHANT_WIDTH + COLUMN_GAP;
        expect(readVariable(container, PINNED_LEFT_EDGE_VARIABLE)).toBe(`${ROW_EDGE}px`);
        expect(readVariable(container, PINNED_LEFT_LEAD_VARIABLE)).toBe(`${ROW_EDGE + ROW_PADDING}px`);
        expect(readVariable(container, getPinnedLeftVariable(0))).toBe(`${HEADINGS_START}px`);
        expect(readVariable(container, getPinnedLeftVariable(1))).toBe(`${merchantLeft}px`);
        expect(readVariable(container, getPinnedLeftVariable(2))).toBe('');
        expect(readVariable(container, PINNED_START_WIDTH_VARIABLE)).toBe(`${regionEnd - ROW_EDGE}px`);
        expect(readVariable(container, STICKY_HEADER_HEIGHT_VARIABLE)).toBe(`${HEADER_HEIGHT}px`);
    });

    it('cuts the line under a row to the pinned region only while columns can pass beneath the pins', () => {
        // Given one table wider than its scroller and one that fits, both with pins and a 12px horizontal scrollbar
        const overflowing = buildTable();
        const fitting = buildTable();
        setProperty(overflowing.scroller, 'scrollWidth', 1400);
        setProperty(fitting.scroller, 'scrollWidth', 900);
        for (const {scroller} of [overflowing, fitting]) {
            setProperty(scroller, 'offsetHeight', 512);
            setProperty(scroller, 'clientHeight', 500);
        }

        // When the hook runs for both
        renderHook(() => usePinnedScrollVariables(overflowing.containerRef, true, PINNED_COLUMNS));
        renderHook(() => usePinnedScrollVariables(fitting.containerRef, true, PINNED_COLUMNS));

        // Then only the overflowing table truncates its error lines at the divider, since nothing passes beneath the pins of one that
        // fits, and both tell the page margin's mask to leave the scrollbar visible
        const regionEnd = HEADINGS_START + DATE_WIDTH + COLUMN_GAP + MERCHANT_WIDTH + COLUMN_GAP;
        expect(readVariable(overflowing.container, PINNED_LINE_WIDTH_VARIABLE)).toBe(`${regionEnd - ROW_EDGE}px`);
        expect(readVariable(fitting.container, PINNED_LINE_WIDTH_VARIABLE)).toBe('');
        expect(readVariable(overflowing.container, PINNED_SCROLLBAR_HEIGHT_VARIABLE)).toBe('12px');
        expect(readVariable(fitting.container, PINNED_SCROLLBAR_HEIGHT_VARIABLE)).toBe('12px');
    });

    it('measures the same offsets while the table is scrolled, since it only measures boxes that never stick', () => {
        // Given a table already scrolled sideways when a column is resized
        const {container, scroller, containerRef} = buildTable();
        renderHook(() => usePinnedScrollVariables(containerRef, true, PINNED_COLUMNS));
        setProperty(scroller, 'scrollLeft', 140);

        // When the resize observer fires
        MockResizeObserver.instances.at(0)?.callback();

        // Then every pin still rests where it does at the table's start
        expect(readVariable(container, getPinnedLeftVariable(0))).toBe(`${HEADINGS_START}px`);
        expect(readVariable(container, PINNED_LEFT_EDGE_VARIABLE)).toBe(`${ROW_EDGE}px`);
    });

    it('writes only when a scroll flips the divider or the mask, and never the scroll offset itself', () => {
        // Given a table with pins at rest
        const {container, scroller, containerRef} = buildTable();
        renderHook(() => usePinnedScrollVariables(containerRef, true, PINNED_COLUMNS));
        const setPropertySpy = jest.spyOn(container.style, 'setProperty');

        // When it scrolls sideways three times and then back to its start
        scrollTo(scroller, 40);
        const writesOnFirstScroll = setPropertySpy.mock.calls.length;
        scrollTo(scroller, 80);
        scrollTo(scroller, 120);
        const writesWhileScrolled = setPropertySpy.mock.calls.length - writesOnFirstScroll;
        scrollTo(scroller, 0);

        // Then the first scroll shows the divider and the mask, the next ones write nothing, and the way back hides both again
        expect(writesOnFirstScroll).toBe(2);
        expect(writesWhileScrolled).toBe(0);
        expect(readVariable(container, PINNED_START_EDGE_OPACITY_VARIABLE)).toBe('0');
        expect(readVariable(container, PINNED_GUTTER_MASK_VISIBILITY_VARIABLE)).toBe('hidden');
    });

    it('re-measures the region when a pinned heading is resized', () => {
        // Given a table with pins
        const {container, merchantHeading, containerRef, setWidth} = buildTable();
        renderHook(() => usePinnedScrollVariables(containerRef, true, PINNED_COLUMNS));
        const resizeObserver = MockResizeObserver.instances.at(0);

        // When the last pinned column is dragged wider, which fires no scroll event
        setWidth(merchantHeading, 200);
        resizeObserver?.callback();

        // Then the cover's divider follows the column's new edge
        const regionEnd = HEADINGS_START + DATE_WIDTH + COLUMN_GAP + 200 + COLUMN_GAP;
        expect(resizeObserver?.observed).toContain(merchantHeading);
        expect(readVariable(container, PINNED_START_WIDTH_VARIABLE)).toBe(`${regionEnd - ROW_EDGE}px`);
    });

    it('stops listening once the table unmounts', () => {
        // Given a table with pins that then unmounts
        const {container, scroller, containerRef} = buildTable();
        const {unmount} = renderHook(() => usePinnedScrollVariables(containerRef, true, PINNED_COLUMNS));
        unmount();

        // When its scroller still fires a scroll event, e.g. while it animates out
        scrollTo(scroller, 300);

        // Then nothing is written anymore and the resize observer is released, so a closed table leaks no work
        expect(readVariable(container, PINNED_START_EDGE_OPACITY_VARIABLE)).toBe('0');
        expect(MockResizeObserver.instances.at(0)?.disconnect).toHaveBeenCalled();
    });

    it('measures nothing for a list that only scrolls vertically, or for a table without pins', () => {
        // Given one list whose table is scrolled by an outer ScrollView, and one table without pins
        const vertical = buildTable();
        const unpinned = buildTable();

        // When the hook runs for both
        renderHook(() => usePinnedScrollVariables(vertical.containerRef, false, PINNED_COLUMNS));
        renderHook(() => usePinnedScrollVariables(unpinned.containerRef, true, []));
        scrollTo(unpinned.scroller, 50);

        // Then neither gets any pinned variable, so tables that don't pin pay nothing on scroll, while the one scrolling both ways
        // still publishes its sticky header's height for focus scrolling to clear
        expect(readVariable(vertical.container, PINNED_START_WIDTH_VARIABLE)).toBe('');
        expect(readVariable(vertical.container, STICKY_HEADER_HEIGHT_VARIABLE)).toBe('');
        expect(readVariable(unpinned.container, PINNED_START_WIDTH_VARIABLE)).toBe('');
        expect(readVariable(unpinned.container, PINNED_START_EDGE_OPACITY_VARIABLE)).toBe('');
        expect(readVariable(unpinned.container, STICKY_HEADER_HEIGHT_VARIABLE)).toBe(`${HEADER_HEIGHT}px`);
    });
});
