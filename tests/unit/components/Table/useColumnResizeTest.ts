import {act, renderHook} from '@testing-library/react-native';

import {RESIZE_INDICATOR_OPACITY_VARIABLE, getColumnWidthVariableName} from '@components/Table/columnResize/columnWidthExpressions';
import type UseColumnResize from '@components/Table/columnResize/useColumnResize';
import type {UseColumnResizeParams} from '@components/Table/columnResize/useColumnResize/types';

import {setTableColumnWidth} from '@libs/actions/TableColumnWidths';

import type React from 'react';

// Jest resolves the native no-op, so the web implementation is loaded by its file name.
const {default: useColumnResize} = jest.requireActual<{default: typeof UseColumnResize}>('@components/Table/columnResize/useColumnResize/index.ts');

jest.mock('@libs/actions/TableColumnWidths', () => ({
    setTableColumnWidth: jest.fn(),
}));

const COLUMN_RESIZING_ID = 'testTable';

const NAME_COLUMN_KEY = 'name';

const resolvedColumnWidths = {name: 200, email: 200, role: 200};

type PointerEventInit = {clientX: number; button?: number};

/** A pointer event carrying only what the hook reads, aimed at the given handle. */
function createPointerEvent(handleElement: HTMLDivElement, {clientX, button = 0}: PointerEventInit): React.PointerEvent<HTMLDivElement> {
    const event = {button, clientX, clientY: 0, pointerId: 1, currentTarget: handleElement, preventDefault: jest.fn(), stopPropagation: jest.fn()};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the hook only reads the fields above
    return event as unknown as React.PointerEvent<HTMLDivElement>;
}

/** Renders the hook with a scope element and one handle inside it, the way the table mounts them. */
function renderColumnResize(params?: Partial<UseColumnResizeParams>) {
    const scopeElement = document.createElement('div');
    const handleElement = document.createElement('div');

    scopeElement.appendChild(handleElement);
    // jsdom has no pointer capture.
    const setPointerCapture = jest.fn();

    handleElement.setPointerCapture = setPointerCapture;
    handleElement.releasePointerCapture = jest.fn();
    handleElement.hasPointerCapture = jest.fn(() => true);

    const initialProps: UseColumnResizeParams = {
        columnResizingID: COLUMN_RESIZING_ID,
        resizableColumnKeys: [NAME_COLUMN_KEY],
        resolvedColumnWidths,
        columnGap: 12,
        ...params,
    };
    const hook = renderHook((props: UseColumnResizeParams) => useColumnResize(props), {initialProps});

    hook.result.current?.setScopeElement(scopeElement);

    const getHandleProps = () => {
        const controller = hook.result.current;

        if (!controller) {
            throw new Error('Expected the hook to return a controller');
        }

        const handleProps = controller.getHandleProps(NAME_COLUMN_KEY);

        if (!handleProps) {
            throw new Error('Expected the column to be resizable');
        }

        return handleProps;
    };

    const readWidth = (columnKey: string) => scopeElement.style.getPropertyValue(getColumnWidthVariableName(columnKey));

    return {...hook, initialProps, scopeElement, handleElement, setPointerCapture, getHandleProps, readWidth};
}

describe('useColumnResize', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.style.cursor = '';
    });

    it('returns no controller when resizing is off', () => {
        // Given a table with no resizing ID, which is how native, narrow layouts and tables that didn't opt in render it
        const params: UseColumnResizeParams = {columnResizingID: undefined, resizableColumnKeys: [NAME_COLUMN_KEY], resolvedColumnWidths, columnGap: 12};

        // When the hook runs
        const {result} = renderHook(() => useColumnResize(params));

        // Then it hands back no controller, so the header renders no handles
        expect(result.current).toBeUndefined();
    });

    it('returns a controller before the columns are measured', () => {
        // Given a resizable table on its first render, before layout, when no column is resizable yet
        const params: UseColumnResizeParams = {columnResizingID: COLUMN_RESIZING_ID, resizableColumnKeys: [], resolvedColumnWidths: {}, columnGap: 12};

        // When the hook runs
        const {result} = renderHook(() => useColumnResize(params));

        // Then it still hands back a controller, so the scope element renders from the start and the header and list
        // don't remount once the table is measured, while no column gets a handle yet
        expect(result.current).toBeDefined();
        expect(result.current?.getHandleProps(NAME_COLUMN_KEY)).toBeUndefined();
    });

    it('paints a drag onto the scope and stores the dragged column on release', () => {
        // Given a 200px column with two 200px columns after it
        const {handleElement, getHandleProps, readWidth} = renderColumnResize();

        // When its edge is dragged 60px right
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        // Then the width is painted straight onto the scope without a React render, and later columns keep their widths
        expect(readWidth('name')).toBe('260px');
        expect(readWidth('email')).toBe('');
        expect(readWidth('role')).toBe('');
        expect(document.body.style.cursor).toBe('col-resize');

        // When the pointer is released
        act(() => {
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        // Then the dragged column is stored, once
        expect(setTableColumnWidth).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidth).toHaveBeenCalledWith(COLUMN_RESIZING_ID, 'name', 260);
        expect(document.body.style.cursor).toBe('');
    });

    it('stores nothing and clears the scope when a drag ends where it started', () => {
        // Given a column being dragged
        const {handleElement, getHandleProps, readWidth} = renderColumnResize();

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        // When the pointer comes back to where it started and is released
        act(() => {
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 100}));
        });

        // Then nothing is stored, and the scope is cleared since no render follows to clear it
        expect(setTableColumnWidth).not.toHaveBeenCalled();
        expect(readWidth('name')).toBe('');
    });

    it('stores the width when the pointer capture is lost mid-drag', () => {
        // Given a column being dragged 40px right
        const {handleElement, getHandleProps} = renderColumnResize();

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 140}));
        });

        // When the browser takes the pointer capture back, e.g. because the window lost focus
        act(() => {
            getHandleProps().onLostPointerCapture?.(createPointerEvent(handleElement, {clientX: 140}));
        });

        // Then the drag ends the same way a release does, so the width the user already sees is kept
        expect(setTableColumnWidth).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidth).toHaveBeenCalledWith(COLUMN_RESIZING_ID, 'name', 240);
        expect(document.body.style.cursor).toBe('');
    });

    it('shows the edge line only while dragging, not on hover', () => {
        // Given a resizable column
        const {handleElement, getHandleProps} = renderColumnResize();
        const readLineOpacity = () => handleElement.style.getPropertyValue(RESIZE_INDICATOR_OPACITY_VARIABLE);

        // When its edge is pressed
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
        });

        // Then the tall line appears, so the user sees which edge is moving
        expect(readLineOpacity()).toBe('1');

        // When the pointer is released
        act(() => {
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 100}));
        });

        // Then the line goes away, even with the pointer still over the edge
        expect(readLineOpacity()).toBe('0');
    });

    it('keeps a dragged width above its floor', () => {
        // Given a 200px column that may not shrink below 180px
        const {handleElement, getHandleProps, readWidth} = renderColumnResize({dragMinWidths: {[NAME_COLUMN_KEY]: 180}});

        // When its edge is dragged far past the left of the window
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: -1000}));
        });

        // Then it stops at its floor, so the last column can't pull the row in from the table's edge
        expect(readWidth(NAME_COLUMN_KEY)).toBe('180px');

        // When the same drag carries on far past the right
        act(() => {
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 5000}));
        });

        // Then it follows the pointer with no upper bound, since the table scrolls to reach later columns
        expect(readWidth(NAME_COLUMN_KEY)).toBe('5100px');
    });

    it('ignores the secondary button', () => {
        // Given a resizable column
        const {handleElement, setPointerCapture, getHandleProps} = renderColumnResize();

        // When its edge is pressed with the secondary button, which opens a context menu
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100, button: 2}));
        });

        // Then no drag starts, so the context menu isn't fighting a captured pointer
        expect(setPointerCapture).not.toHaveBeenCalled();
        expect(document.body.style.cursor).toBe('');
    });

    it('resets the cursor when unmounted mid-drag', () => {
        // Given a column being dragged, which puts the resize cursor on the whole page
        const columnResize = renderColumnResize();
        const {handleElement, getHandleProps} = columnResize;

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
        });

        expect(document.body.style.cursor).toBe('col-resize');

        // When the table unmounts, e.g. because the user navigated away mid-drag
        columnResize.unmount();

        // Then the resize cursor doesn't stay stuck on the page
        expect(document.body.style.cursor).toBe('');
    });

    it('leaves the cursor alone when unmounted with no drag', () => {
        // Given a cursor some other part of the page put on the body, and a table that isn't being dragged
        document.body.style.cursor = 'grabbing';
        const columnResize = renderColumnResize();

        // When the table unmounts
        columnResize.unmount();

        // Then the cursor is untouched, since only a drag of this table set it
        expect(document.body.style.cursor).toBe('grabbing');
    });

    it('clears the painted widths once the stored width renders', () => {
        // Given a drag that was released and whose width was stored
        const {handleElement, getHandleProps, readWidth, rerender, initialProps} = renderColumnResize();

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 160}));
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        expect(readWidth('name')).toBe('260px');

        // When the stored width comes back from Onyx and the table resolves it
        rerender({...initialProps, resolvedColumnWidths: {...resolvedColumnWidths, name: 260}});

        // Then the painted width steps aside, so the column paints the fallback React rendered and later resolved widths aren't masked
        expect(readWidth('name')).toBe('');
    });
});
