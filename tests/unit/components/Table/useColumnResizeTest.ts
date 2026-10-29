import {act, renderHook} from '@testing-library/react-native';

import {RESIZE_GRIP_HOVER_VARIABLE, RESIZE_INDICATOR_OPACITY_VARIABLE, getColumnWidthVariableName} from '@components/Table/columnResize/columnWidthExpressions';
import type UseColumnResize from '@components/Table/columnResize/useColumnResize';
import type {UseColumnResizeParams} from '@components/Table/columnResize/useColumnResize/types';

import {setTableColumnWidths} from '@libs/actions/TableColumnWidths';

import CONST from '@src/CONST';

import type React from 'react';

// Jest resolves the native no-op, so the web implementation is loaded by its file name.
const {default: useColumnResize} = jest.requireActual<{default: typeof UseColumnResize}>('@components/Table/columnResize/useColumnResize/index.ts');

// Jest resolves the native cursor styles, which are empty, so the web ones are loaded by their file name too.
jest.mock('@styles/utils/cursor', () => jest.requireActual<Record<string, unknown>>('@styles/utils/cursor/index.ts'));

jest.mock('@libs/actions/TableColumnWidths', () => ({
    setTableColumnWidths: jest.fn(),
}));

const COLUMN_RESIZING_ID = 'testTable';

const NAME_COLUMN_KEY = 'name';

const resolvedColumnWidths = {name: 200, email: 200, role: 200};

/** Stands in for the layout: the width each column's content fits in, bounds already applied. */
const FIT_COLUMN_WIDTHS: Record<string, number> = {name: 120, email: 300, role: 80};

/** Every column counts as resized and resets to the width its content fits in. */
function getTargetColumnWidth(columnKey: string): number | undefined {
    return FIT_COLUMN_WIDTHS[columnKey];
}

/** Stands in for the resolver: the email column absorbs the whole resize. */
function getResizedColumnWidths(columnKey: string, width: number): Record<string, number> {
    return {email: 400 - width, [columnKey]: width};
}

/** Stands in for the resolver's layout, wrapping the painted widths in what the layout was sized for. A column handed back leaves no layout. */
function getStoredTableColumnWidths(columnWidths: Record<string, number>, columnKey: string, isResized: boolean) {
    return isResized ? {availableColumnsWidth: 600, columnWidths, resizedColumnKeys: [columnKey]} : null;
}

type PointerEventInit = {clientX: number; clientY?: number; button?: number};

/** A pointer event carrying only what the hook reads, aimed at the given handle. */
function createPointerEvent(handleElement: HTMLDivElement, {clientX, clientY = 0, button = 0}: PointerEventInit): React.PointerEvent<HTMLDivElement> {
    const event = {button, clientX, clientY, pointerId: 1, currentTarget: handleElement, preventDefault: jest.fn(), stopPropagation: jest.fn()};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the hook only reads the fields above
    return event as unknown as React.PointerEvent<HTMLDivElement>;
}

/** Renders the hook with a scope element and one heading cell holding a handle inside it, the way the table mounts them. */
function renderColumnResize(params?: Partial<UseColumnResizeParams>) {
    const scopeElement = document.createElement('div');
    const headingElement = document.createElement('div');
    const handleElement = document.createElement('div');

    scopeElement.appendChild(headingElement);
    headingElement.appendChild(handleElement);
    // jsdom has no layout: a 200x40 heading whose handle starts 2px inside its right edge and spans the 12px gap past it.
    document.elementFromPoint = (x, y) => {
        if (y > 40 || x > 212) {
            return document.body;
        }

        return x > 198 ? handleElement : headingElement;
    };
    // jsdom has no pointer capture.
    const setPointerCapture = jest.fn();

    handleElement.setPointerCapture = setPointerCapture;
    handleElement.releasePointerCapture = jest.fn();
    handleElement.hasPointerCapture = jest.fn(() => true);

    const initialProps: UseColumnResizeParams = {
        columnResizingID: COLUMN_RESIZING_ID,
        resizableColumnKeys: [NAME_COLUMN_KEY],
        getResizedColumnWidths,
        resolvedColumnWidths,
        getStoredTableColumnWidths,
        getTargetColumnWidth,
        columnGap: 12,
        ...params,
    };
    const hook = renderHook((props: UseColumnResizeParams) => useColumnResize(props), {initialProps});

    hook.result.current?.setScopeElement(scopeElement);

    const getHandleProps = (columnKey = NAME_COLUMN_KEY) => {
        const controller = hook.result.current;

        if (!controller) {
            throw new Error('Expected the hook to return a controller');
        }

        const handleProps = controller.getHandleProps(columnKey);

        if (!handleProps) {
            throw new Error('Expected the column to be resizable');
        }

        return handleProps;
    };

    const readWidth = (columnKey: string) => scopeElement.style.getPropertyValue(getColumnWidthVariableName(columnKey));

    const readGripHover = () => handleElement.style.getPropertyValue(RESIZE_GRIP_HOVER_VARIABLE);

    /** Hands the handle element to the handle's ref, the way React does when it mounts the handle. */
    const mountHandle = () => {
        const {ref} = getHandleProps();

        if (typeof ref !== 'function') {
            throw new Error('Expected the handle to take a callback ref');
        }

        return ref(handleElement);
    };

    /** Presses and releases an edge without moving the pointer. */
    const click = (columnKey = NAME_COLUMN_KEY) => {
        act(() => {
            getHandleProps(columnKey).onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps(columnKey).onPointerUp?.(createPointerEvent(handleElement, {clientX: 100}));
        });
    };

    return {...hook, initialProps, scopeElement, headingElement, handleElement, setPointerCapture, getHandleProps, readWidth, readGripHover, mountHandle, click};
}

describe('useColumnResize', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        document.body.style.cursor = '';
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns no controller when resizing is off', () => {
        // Given a table with no resizing ID, which is how native, narrow layouts and tables that didn't opt in render it
        const params: UseColumnResizeParams = {
            columnResizingID: undefined,
            resizableColumnKeys: [NAME_COLUMN_KEY],
            getResizedColumnWidths,
            resolvedColumnWidths,
            getStoredTableColumnWidths,
            columnGap: 12,
        };

        // When the hook runs
        const {result} = renderHook(() => useColumnResize(params));

        // Then it hands back no controller, so the header renders no handles
        expect(result.current).toBeUndefined();
    });

    it('returns a controller before the columns are measured', () => {
        // Given a resizable table on its first render, before layout, when no column is resizable yet
        const params: UseColumnResizeParams = {
            columnResizingID: COLUMN_RESIZING_ID,
            resizableColumnKeys: [],
            getResizedColumnWidths,
            resolvedColumnWidths: {},
            getStoredTableColumnWidths,
            columnGap: 12,
        };

        // When the hook runs
        const {result} = renderHook(() => useColumnResize(params));

        // Then it still hands back a controller, so the scope element renders from the start and the header and list
        // don't remount once the table is measured, while no column gets a handle yet
        expect(result.current).toBeDefined();
        expect(result.current?.getHandleProps(NAME_COLUMN_KEY)).toBeUndefined();
    });

    it('paints a drag onto the scope and stores the dragged column on release', () => {
        // Given a 200px column with two 200px columns after it, the first of which absorbs its resize
        const {handleElement, getHandleProps, readWidth} = renderColumnResize();

        // When its edge is dragged 60px right
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        // Then the dragged column and its absorber are painted straight onto the scope without a React render
        expect(readWidth('name')).toBe('260px');
        expect(readWidth('email')).toBe('140px');
        expect(document.body.style.cursor).toBe('col-resize');

        // When the pointer is released
        act(() => {
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        // Then every painted width is saved once, with the dragged column marked as resized, so a reload moves nothing
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidths).toHaveBeenCalledWith(COLUMN_RESIZING_ID, getStoredTableColumnWidths({name: 260, email: 140, role: 200}, 'name', true));
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
        expect(setTableColumnWidths).not.toHaveBeenCalled();
        expect(readWidth('name')).toBe('');
    });

    it('stores nothing and clears the scope when the table has no layout to save', () => {
        // Given a resizable table that hands over no layout to save
        const {handleElement, getHandleProps, readWidth} = renderColumnResize({getStoredTableColumnWidths: undefined});

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        // When a drag that moved the column is released
        act(() => {
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        // Then nothing is stored, and the painted widths are cleared since no stored width renders to replace them
        expect(setTableColumnWidths).not.toHaveBeenCalled();
        expect(readWidth('name')).toBe('');
        expect(readWidth('email')).toBe('');
    });

    it('keeps the painted widths when new resolved widths render mid-drag', () => {
        // Given a column being dragged 60px right
        const {handleElement, getHandleProps, readWidth, rerender, initialProps} = renderColumnResize();

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        // When the table renders new resolved widths before the drag ends, e.g. because the window resized
        rerender({...initialProps, resolvedColumnWidths: {name: 210, email: 190, role: 200}});

        // Then the drag keeps painting where the pointer put it, so the column doesn't jump away from the pointer
        expect(readWidth('name')).toBe('260px');
        expect(readWidth('email')).toBe('140px');
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
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidths).toHaveBeenCalledWith(COLUMN_RESIZING_ID, expect.objectContaining({columnWidths: expect.objectContaining({name: 240}), resizedColumnKeys: ['name']}));
        expect(document.body.style.cursor).toBe('');
    });

    it('shows the edge line only while dragging, not on click, and hides it on release', () => {
        // Given a resizable column
        const {handleElement, getHandleProps} = renderColumnResize();
        const readLineOpacity = () => handleElement.style.getPropertyValue(RESIZE_INDICATOR_OPACITY_VARIABLE);

        // When its edge is pressed
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
        });

        // Then no line appears yet, since the press may still be a click that fits the column
        expect(readLineOpacity()).toBe('');

        // When the pointer moves past the click slop
        act(() => {
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 110}));
        });

        // Then the tall line appears, so the user sees which edge is moving
        expect(readLineOpacity()).toBe('1');

        // When the pointer is released
        act(() => {
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 110}));
        });

        // Then the line goes away, even with the pointer still over the edge
        expect(readLineOpacity()).toBe('0');
    });

    it('shows the grip while the heading is hovered', () => {
        // Given a mounted resizable column
        const {headingElement, readGripHover, mountHandle} = renderColumnResize();

        mountHandle();

        // When the pointer enters its heading cell anywhere, not only over the edge
        headingElement.dispatchEvent(new Event('pointerenter'));

        // Then the grip shows, so the user can find the edge before reaching it
        expect(readGripHover()).toBe('1');

        // When the pointer leaves the heading
        headingElement.dispatchEvent(new Event('pointerleave'));

        // Then the grip goes away
        expect(readGripHover()).toBe('0');
    });

    it('stops tracking the heading once the handle unmounts', () => {
        // Given a resizable column whose handle mounted and then unmounted
        const {headingElement, readGripHover, mountHandle} = renderColumnResize();

        const cleanUp = mountHandle();
        cleanUp?.();

        // When the pointer enters the heading afterwards
        headingElement.dispatchEvent(new Event('pointerenter'));

        // Then nothing is written, so a heading outliving its handle doesn't keep a listener writing to a detached element
        expect(readGripHover()).toBe('');
    });

    it('hides the grip when a drag is released off the heading', () => {
        // Given a hovered heading whose edge is being dragged
        const {headingElement, handleElement, getHandleProps, readGripHover, mountHandle} = renderColumnResize();

        mountHandle();
        headingElement.dispatchEvent(new Event('pointerenter'));

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 190, clientY: 20}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 400, clientY: 300}));
        });

        // When the pointer is released outside the heading, where pointer capture kept the heading from hearing it leave
        act(() => {
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 400, clientY: 300}));
        });

        // Then the grip hides rather than lingering on a heading the pointer isn't over
        expect(readGripHover()).toBe('0');
    });

    it('hides the grip when the pointer capture is lost off the heading', () => {
        // Given a hovered heading whose edge is being dragged off the heading
        const {headingElement, handleElement, getHandleProps, readGripHover, mountHandle} = renderColumnResize();

        mountHandle();
        headingElement.dispatchEvent(new Event('pointerenter'));

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 190, clientY: 20}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 400, clientY: 300}));
        });

        // When the browser takes the pointer capture back there, e.g. because the window lost focus
        act(() => {
            getHandleProps().onLostPointerCapture?.(createPointerEvent(handleElement, {clientX: 400, clientY: 300}));
        });

        // Then the grip hides, the same as a release there, rather than lingering on a heading the pointer isn't over
        expect(readGripHover()).toBe('0');
    });

    it('keeps the grip when a drag is released on the heading', () => {
        // Given a hovered heading whose edge is being dragged
        const {headingElement, handleElement, getHandleProps, readGripHover, mountHandle} = renderColumnResize();

        mountHandle();
        headingElement.dispatchEvent(new Event('pointerenter'));

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 190, clientY: 20}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 150, clientY: 20}));
        });

        // When the pointer is released still inside the heading
        act(() => {
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 150, clientY: 20}));
        });

        // Then the grip comes back, since the pointer is still over the heading
        expect(readGripHover()).toBe('1');
    });

    it('keeps the grip when a drag is released on the handle overhanging the heading', () => {
        // Given a hovered heading whose edge is being dragged
        const {headingElement, handleElement, getHandleProps, readGripHover, mountHandle} = renderColumnResize();

        mountHandle();
        headingElement.dispatchEvent(new Event('pointerenter'));

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 190, clientY: 20}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 203, clientY: 20}));
        });

        // When the pointer is released on the part of the handle past the heading's box, where a drag usually ends
        act(() => {
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 203, clientY: 20}));
        });

        // Then the grip comes back, since the browser still counts the pointer as inside the heading and won't fire another pointerenter
        expect(readGripHover()).toBe('1');
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

    it('fits the column to its content when its edge is clicked', () => {
        // Given a 200px column whose content fits in 120px
        const {handleElement, getHandleProps, readWidth} = renderColumnResize();

        // When its edge is clicked, with the pointer wobbling less than the click slop
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 100 + CONST.TABLES.COLUMN_RESIZE.DRAG_SLOP}));
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 100 + CONST.TABLES.COLUMN_RESIZE.DRAG_SLOP}));
        });

        // Then the column is painted at its content width the way a drag would, with its absorber taking the change,
        // and the layout is saved with the column marked as resized, rather than moved by the wobble
        expect(readWidth(NAME_COLUMN_KEY)).toBe('120px');
        expect(readWidth('email')).toBe('280px');
        expect(document.body.style.cursor).toBe('');
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidths).toHaveBeenCalledWith(COLUMN_RESIZING_ID, getStoredTableColumnWidths({name: 120, email: 280, role: 200}, NAME_COLUMN_KEY, true));
    });

    it('clears the layout when a fitted column is clicked again and no other column was dragged', () => {
        // Given a resizable column that is the only one the user sized
        const {click} = renderColumnResize();

        // When its edge is clicked once to fit it, then again
        click();
        click();

        // Then the second click undoes the fit by clearing the saved layout, so the table sizes every column from its content again
        expect(setTableColumnWidths).toHaveBeenCalledTimes(2);
        expect(setTableColumnWidths).toHaveBeenLastCalledWith(COLUMN_RESIZING_ID, null);
    });

    it('resets a fitted column on a second click while other dragged columns keep the layout', () => {
        // Given a 200px column whose content fits in 120px, and another column the user dragged too
        const {click, readWidth} = renderColumnResize({
            getTargetColumnWidth: (columnKey, target) => (target === CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET.RESET ? 200 : getTargetColumnWidth(columnKey)),
            getStoredTableColumnWidths: (columnWidths) => ({availableColumnsWidth: 600, columnWidths, resizedColumnKeys: ['role']}),
        });

        // When its edge is clicked once to fit it, then again
        click();
        click();

        // Then it goes back to its reset width with its absorber taking the change, and the layout is saved without it
        // among the resized columns, so it absorbs room changes again
        expect(readWidth(NAME_COLUMN_KEY)).toBe('200px');
        expect(readWidth('email')).toBe('200px');
        expect(setTableColumnWidths).toHaveBeenCalledTimes(2);
        expect(setTableColumnWidths).toHaveBeenLastCalledWith(COLUMN_RESIZING_ID, {
            availableColumnsWidth: 600,
            columnWidths: {name: 200, email: 200, role: 200},
            resizedColumnKeys: ['role'],
        });
    });

    it('stores nothing when a column the user never sized already fits its content', () => {
        // Given a column painted at its content width that the layout has no reset width for, since the user never sized it
        const {click} = renderColumnResize({
            resolvedColumnWidths: {...resolvedColumnWidths, name: 120},
            getTargetColumnWidth: (columnKey, target) => (target === CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET.RESET ? undefined : getTargetColumnWidth(columnKey)),
        });

        // When its edge is clicked
        click();

        // Then nothing is stored, so the column isn't marked as sized by the user for nothing
        expect(setTableColumnWidths).not.toHaveBeenCalled();
    });

    it('does nothing on click when the column has no fitted width', () => {
        // Given a column the layout can't fit, e.g. because its content couldn't be measured
        const {click, readWidth} = renderColumnResize({
            getTargetColumnWidth: (columnKey, target) => (target === CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET.FIT ? undefined : getTargetColumnWidth(columnKey)),
        });

        // When its edge is clicked
        click();

        // Then the column keeps its width, rather than guessing one
        expect(readWidth(NAME_COLUMN_KEY)).toBe('');
        expect(setTableColumnWidths).not.toHaveBeenCalled();
    });
});
