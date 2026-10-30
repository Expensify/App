import {act, renderHook} from '@testing-library/react-native';

import {
    RESIZE_GRIP_HOVER_VARIABLE,
    RESIZE_INDICATOR_HEIGHT_VARIABLE,
    RESIZE_INDICATOR_OPACITY_VARIABLE,
    getColumnWidthVariableName,
} from '@components/Table/columnResize/columnWidthExpressions';
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

/** A key press carrying only what the hook reads, aimed at the given handle, with its mocks to assert on. */
function createKeyboardEvent(handleElement: HTMLDivElement, key: string) {
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    const event = {key, currentTarget: handleElement, preventDefault, stopPropagation};

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the hook only reads the fields above
    return {event: event as unknown as React.KeyboardEvent<HTMLDivElement>, preventDefault, stopPropagation};
}

/** A focus event aimed at the given handle, which matches `:focus-visible` only when focused from the keyboard. */
function createFocusEvent(handleElement: HTMLDivElement, isFocusVisible: boolean): React.FocusEvent<HTMLDivElement> {
    // jsdom doesn't track how an element got focus.
    jest.spyOn(handleElement, 'matches').mockImplementation((selector: string) => selector === ':focus-visible' && isFocusVisible);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the hook only reads the field above
    return {currentTarget: handleElement} as unknown as React.FocusEvent<HTMLDivElement>;
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

/** Lets a click's wait for a second click run out. */
function waitOutDoubleClick() {
    act(() => {
        jest.advanceTimersByTime(CONST.TABLES.COLUMN_RESIZE.DOUBLE_CLICK_INTERVAL);
    });
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

    it('fits the column to its content once a click on its edge turns out not to be a double-click', () => {
        // Given a 200px column whose content fits in 120px
        const {handleElement, getHandleProps, readWidth} = renderColumnResize();

        // When its edge is clicked, with the pointer wobbling less than the click slop
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 100 + CONST.RESIZE_HANDLE.DRAG_SLOP}));
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 100 + CONST.RESIZE_HANDLE.DRAG_SLOP}));
        });

        // Then the column stays put while a second click may still come, since moving the edge now would send that click to the heading
        expect(readWidth(NAME_COLUMN_KEY)).toBe('');
        expect(setTableColumnWidths).not.toHaveBeenCalled();
        expect(document.body.style.cursor).toBe('');

        // When no second click comes
        waitOutDoubleClick();

        // Then the column is painted at its content width the way a drag would, with its absorber taking the change,
        // and the layout is saved with the column marked as resized, rather than moved by the wobble
        expect(readWidth(NAME_COLUMN_KEY)).toBe('120px');
        expect(readWidth('email')).toBe('280px');
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidths).toHaveBeenCalledWith(COLUMN_RESIZING_ID, getStoredTableColumnWidths({name: 120, email: 280, role: 200}, NAME_COLUMN_KEY, true));
    });

    it('clears the layout on double-click when no other column was dragged, without fitting it first', () => {
        // Given a resizable column that is the only one the user dragged
        const {click, readWidth} = renderColumnResize();

        // When its edge is clicked twice in quick succession
        click();
        click();
        waitOutDoubleClick();

        // Then the saved layout is cleared, so the table sizes every column from its content again, and nothing is
        // painted since the cleared layout reflows the columns. The first click never fits the column, so the edge
        // doesn't move out from under the second click
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidths).toHaveBeenCalledWith(COLUMN_RESIZING_ID, null);
        expect(readWidth(NAME_COLUMN_KEY)).toBe('');
    });

    it('hands the column back to content sizing on double-click while other dragged columns keep the layout', () => {
        // Given a resizable column, and another column the user dragged too
        const {click, readWidth} = renderColumnResize({
            getStoredTableColumnWidths: (columnWidths) => ({availableColumnsWidth: 600, columnWidths, resizedColumnKeys: ['role']}),
        });

        // When its edge is double-clicked
        click();
        click();

        // Then it is painted at its content width with its absorber taking the change, and the layout is saved without
        // it among the resized columns, so it absorbs room changes again
        expect(readWidth(NAME_COLUMN_KEY)).toBe('120px');
        expect(readWidth('email')).toBe('280px');
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidths).toHaveBeenCalledWith(COLUMN_RESIZING_ID, {
            availableColumnsWidth: 600,
            columnWidths: {name: 120, email: 280, role: 200},
            resizedColumnKeys: ['role'],
        });
    });

    it('drags without fitting when the edge is pressed again right after a click', () => {
        // Given a click on a 200px column's edge that is still waiting for a second click
        const {handleElement, getHandleProps, click, readWidth} = renderColumnResize();

        click();

        // When the edge is pressed again and dragged 60px right
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 160}));
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 160}));
        });
        waitOutDoubleClick();

        // Then only the drag counts, so the column isn't fitted once the user has moved on to dragging it
        expect(readWidth(NAME_COLUMN_KEY)).toBe('260px');
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidths).toHaveBeenCalledWith(COLUMN_RESIZING_ID, getStoredTableColumnWidths({name: 260, email: 140, role: 200}, NAME_COLUMN_KEY, true));
    });

    it('fits a clicked column right away when another edge is clicked', () => {
        // Given a click on one column's edge that is still waiting for a second click
        const {click} = renderColumnResize({resizableColumnKeys: [NAME_COLUMN_KEY, 'email']});

        click(NAME_COLUMN_KEY);

        // When another column's edge is clicked
        click('email');

        // Then the first column is fitted, since clicks on two edges aren't a double-click, and the second still waits
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidths).toHaveBeenCalledWith(COLUMN_RESIZING_ID, getStoredTableColumnWidths({name: 120, email: 280, role: 200}, NAME_COLUMN_KEY, true));

        // When no second click comes
        waitOutDoubleClick();

        // Then the second column is fitted too
        expect(setTableColumnWidths).toHaveBeenLastCalledWith(COLUMN_RESIZING_ID, getStoredTableColumnWidths({name: 120, email: 300, role: 200}, 'email', true));
    });

    it('drops a waiting click when the table unmounts', () => {
        // Given a click on an edge that is still waiting for a second click
        const columnResize = renderColumnResize();

        columnResize.click();

        // When the table unmounts before the wait is over
        columnResize.unmount();
        waitOutDoubleClick();

        // Then nothing is stored for a table that is gone
        expect(setTableColumnWidths).not.toHaveBeenCalled();
    });

    it('stores nothing when a clicked column already fits its content', () => {
        // Given a column already painted at its content width
        const {click} = renderColumnResize({resolvedColumnWidths: {...resolvedColumnWidths, name: 120}});

        // When its edge is clicked
        click();
        waitOutDoubleClick();

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
        waitOutDoubleClick();

        // Then the column keeps its width, rather than guessing one
        expect(readWidth(NAME_COLUMN_KEY)).toBe('');
        expect(setTableColumnWidths).not.toHaveBeenCalled();
    });

    it('does nothing on double-click when the column was never resized', () => {
        // Given a column the user never sized, so the layout has nothing to reset for it
        const {click, readWidth} = renderColumnResize({
            getTargetColumnWidth: (columnKey, target) => (target === CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET.RESET ? undefined : getTargetColumnWidth(columnKey)),
        });

        // When its edge is double-clicked
        click();
        click();
        waitOutDoubleClick();

        // Then nothing is painted or saved, so the columns the user did size keep their widths
        expect(readWidth(NAME_COLUMN_KEY)).toBe('');
        expect(setTableColumnWidths).not.toHaveBeenCalled();
    });

    it('exposes the edge to assistive technology as a focusable separator holding the column width', () => {
        // Given a 200px resizable column
        const {getHandleProps} = renderColumnResize();

        // When the header renders its edge
        const handleProps = getHandleProps();

        // Then it can be reached with Tab and is announced as a vertical separator at the column's width, inside a range
        // that holds it, since a separator's maximum otherwise defaults to 100
        expect(handleProps.role).toBe('separator');
        expect(handleProps.tabIndex).toBe(0);
        expect(handleProps['aria-orientation']).toBe('vertical');
        expect(handleProps['aria-valuenow']).toBe(200);
        expect(handleProps['aria-valuemin']).toBe(CONST.TABLES.COLUMN_RESIZE.MIN_WIDTH);
        expect(handleProps['aria-valuemax']).toBeGreaterThan(200);
    });

    it('moves a focused edge by one step per arrow key and stores the width once the key is released', () => {
        // Given a 200px column whose edge has focus
        const {handleElement, getHandleProps, readWidth} = renderColumnResize();
        const arrowRight = createKeyboardEvent(handleElement, 'ArrowRight');

        // When the right arrow is pressed and held for one repeat
        act(() => {
            getHandleProps().onKeyDown?.(arrowRight.event);
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'ArrowRight').event);
        });

        // Then the column widens by a step per press right away, without the table also scrolling sideways, and nothing
        // is stored yet, since each store's render would pull the edge back to the stored width mid-hold
        const widenedWidth = 200 + 2 * CONST.TABLES.COLUMN_RESIZE.KEYBOARD_STEP;
        expect(readWidth(NAME_COLUMN_KEY)).toBe(`${widenedWidth}px`);
        expect(arrowRight.preventDefault).toHaveBeenCalled();
        expect(setTableColumnWidths).not.toHaveBeenCalled();

        // When the key is released
        act(() => {
            getHandleProps().onKeyUp?.(createKeyboardEvent(handleElement, 'ArrowRight').event);
        });

        // Then the width the user sees is stored, once
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
        expect(setTableColumnWidths).toHaveBeenCalledWith(
            COLUMN_RESIZING_ID,
            getStoredTableColumnWidths({...resolvedColumnWidths, ...getResizedColumnWidths(NAME_COLUMN_KEY, widenedWidth)}, NAME_COLUMN_KEY, true),
        );
    });

    it('stores an arrow-key width when focus leaves before the key is released', () => {
        // Given a column edge moved by the left arrow
        const {handleElement, getHandleProps} = renderColumnResize();

        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'ArrowLeft').event);
        });

        // When focus moves on, so the key release lands elsewhere
        act(() => {
            getHandleProps().onBlur?.(createFocusEvent(handleElement, false));
        });

        // Then the width is stored anyway, rather than left painted until the next render drops it
        const narrowedWidth = 200 - CONST.TABLES.COLUMN_RESIZE.KEYBOARD_STEP;
        expect(setTableColumnWidths).toHaveBeenCalledWith(
            COLUMN_RESIZING_ID,
            getStoredTableColumnWidths({...resolvedColumnWidths, ...getResizedColumnWidths(NAME_COLUMN_KEY, narrowedWidth)}, NAME_COLUMN_KEY, true),
        );
    });

    it('stops a focused edge at the drag bounds and stores nothing past them', () => {
        // Given a column already at the narrowest width a drag allows it
        const {handleElement, getHandleProps, readWidth} = renderColumnResize({dragMinWidths: {[NAME_COLUMN_KEY]: 200}});

        // When the left arrow is pressed and released
        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'ArrowLeft').event);
            getHandleProps().onKeyUp?.(createKeyboardEvent(handleElement, 'ArrowLeft').event);
        });

        // Then nothing changes, the same as dragging past the bound
        expect(readWidth(NAME_COLUMN_KEY)).toBe('');
        expect(setTableColumnWidths).not.toHaveBeenCalled();
    });

    it('leaves a column narrower than the drag bound alone when narrowing it', () => {
        // Given a column content-sized below the narrowest width a drag allows
        const {handleElement, getHandleProps, readWidth} = renderColumnResize({resolvedColumnWidths: {...resolvedColumnWidths, name: 40}});

        // When the left arrow is pressed and released
        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'ArrowLeft').event);
            getHandleProps().onKeyUp?.(createKeyboardEvent(handleElement, 'ArrowLeft').event);
        });

        // Then the column stays put, rather than jumping wider to the bound against the arrow pressed
        expect(readWidth(NAME_COLUMN_KEY)).toBe('');
        expect(setTableColumnWidths).not.toHaveBeenCalled();
    });

    it('ignores the arrow keys mid-drag', () => {
        // Given a column being dragged 60px right
        const {handleElement, getHandleProps, readWidth} = renderColumnResize();

        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 160}));
        });

        // When an arrow key is pressed and released before the drag ends
        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'ArrowRight').event);
            getHandleProps().onKeyUp?.(createKeyboardEvent(handleElement, 'ArrowRight').event);
        });

        // Then the drag keeps the width, and nothing is stored behind its back
        expect(readWidth(NAME_COLUMN_KEY)).toBe('260px');
        expect(setTableColumnWidths).not.toHaveBeenCalled();
    });

    it('fits a focused column to its content on Enter, and resets it on the next press', () => {
        // Given a 200px column whose content fits in 120px
        const {handleElement, getHandleProps, readWidth, rerender, initialProps} = renderColumnResize();

        // When Enter is pressed on its edge
        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'Enter').event);
        });

        // Then the column is fitted to its content, the same as a click
        expect(readWidth(NAME_COLUMN_KEY)).toBe('120px');
        expect(setTableColumnWidths).toHaveBeenCalledWith(COLUMN_RESIZING_ID, getStoredTableColumnWidths({name: 120, email: 280, role: 200}, NAME_COLUMN_KEY, true));

        // When the stored width renders and Space is pressed
        rerender({...initialProps, resolvedColumnWidths: {name: 120, email: 280, role: 200}});
        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, ' ').event);
        });

        // Then the column is handed back to content sizing, the same as a double-click, since one key can't tell the two apart
        expect(setTableColumnWidths).toHaveBeenCalledTimes(2);
        expect(setTableColumnWidths).toHaveBeenLastCalledWith(COLUMN_RESIZING_ID, null);
    });

    it('toggles once while Enter is held', () => {
        // Given a column whose content fits in 120px, fitted by a first Enter press whose width has rendered
        const {handleElement, getHandleProps, rerender, initialProps} = renderColumnResize();

        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'Enter').event);
        });
        rerender({...initialProps, resolvedColumnWidths: {name: 120, email: 280, role: 200}});

        // When the held key auto-repeats
        act(() => {
            getHandleProps().onKeyDown?.({...createKeyboardEvent(handleElement, 'Enter').event, repeat: true});
        });

        // Then the repeat doesn't reset the column, so holding the key doesn't flip between fitted and reset
        expect(setTableColumnWidths).toHaveBeenCalledTimes(1);
    });

    it('leaves other keys to the page', () => {
        // Given a focused column edge
        const {handleElement, getHandleProps} = renderColumnResize();
        const tab = createKeyboardEvent(handleElement, 'Tab');

        // When Tab is pressed
        act(() => {
            getHandleProps().onKeyDown?.(tab.event);
        });

        // Then the key does its usual job, moving focus on, and the column is untouched
        expect(tab.preventDefault).not.toHaveBeenCalled();
        expect(tab.stopPropagation).not.toHaveBeenCalled();
        expect(setTableColumnWidths).not.toHaveBeenCalled();
    });

    it('shows the edge line while the edge has keyboard focus', () => {
        // Given a resizable column
        const {handleElement, getHandleProps} = renderColumnResize();
        const readLineOpacity = () => handleElement.style.getPropertyValue(RESIZE_INDICATOR_OPACITY_VARIABLE);

        // When its edge is focused by a pointer press
        act(() => {
            getHandleProps().onFocus?.(createFocusEvent(handleElement, false));
        });

        // Then no line appears, since a press shows it only once a drag starts
        expect(readLineOpacity()).toBe('');

        // When the edge is focused from the keyboard
        act(() => {
            getHandleProps().onFocus?.(createFocusEvent(handleElement, true));
        });

        // Then the line appears, so the user sees which edge the arrow keys move
        expect(readLineOpacity()).toBe('1');

        // When focus moves on
        act(() => {
            getHandleProps().onBlur?.(createFocusEvent(handleElement, false));
        });

        // Then the line goes away
        expect(readLineOpacity()).toBe('0');
    });

    it('keeps an arrow-key width when new resolved widths render before the key is released', () => {
        // Given a 200px column edge moved one step right by a held arrow key
        const {handleElement, getHandleProps, readWidth, rerender, initialProps} = renderColumnResize();

        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'ArrowRight').event);
        });

        // When the table renders new resolved widths mid-hold, e.g. because another table's stored widths changed
        rerender({...initialProps, resolvedColumnWidths: {name: 210, email: 190, role: 200}});

        // Then the edge stays where the key put it, so the next press doesn't step from the resolved width and snap back
        expect(readWidth(NAME_COLUMN_KEY)).toBe(`${200 + CONST.TABLES.COLUMN_RESIZE.KEYBOARD_STEP}px`);
    });

    it('updates the announced width on each arrow press, before the key is released', () => {
        // Given a 200px column whose edge has focus
        const {handleElement, getHandleProps} = renderColumnResize();

        // When the right arrow is pressed and still held
        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'ArrowRight').event);
        });

        // Then the separator's value follows the painted width, since nothing renders until the key is released
        expect(handleElement.getAttribute('aria-valuenow')).toBe(String(200 + CONST.TABLES.COLUMN_RESIZE.KEYBOARD_STEP));
    });

    it('keeps the edge line after dragging an edge that has keyboard focus', () => {
        // Given an edge focused from the keyboard, so its line shows
        const {handleElement, getHandleProps} = renderColumnResize();
        const readLineOpacity = () => handleElement.style.getPropertyValue(RESIZE_INDICATOR_OPACITY_VARIABLE);

        act(() => {
            getHandleProps().onFocus?.(createFocusEvent(handleElement, true));
        });

        // When the edge is dragged and released
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
            getHandleProps().onPointerMove?.(createPointerEvent(handleElement, {clientX: 110}));
            getHandleProps().onPointerUp?.(createPointerEvent(handleElement, {clientX: 110}));
        });

        // Then the line stays, since the edge still has keyboard focus and the arrow keys still move it
        expect(readLineOpacity()).toBe('1');
    });

    it('stretches the edge line over rows that load while the edge has keyboard focus', () => {
        // Given an edge focused from the keyboard over a table whose rows end 100px down
        const {handleElement, scopeElement, getHandleProps} = renderColumnResize();
        const readLineHeight = () => handleElement.style.getPropertyValue(RESIZE_INDICATOR_HEIGHT_VARIABLE);
        const addRowEndingAt = (bottom: number) => {
            const rowElement = document.createElement('div');
            rowElement.dataset.tableRow = 'true';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- jsdom has no layout, and the hook only reads the bottom
            jest.spyOn(rowElement, 'getBoundingClientRect').mockReturnValue({bottom} as DOMRect);
            scopeElement.appendChild(rowElement);
        };

        addRowEndingAt(100);
        act(() => {
            getHandleProps().onFocus?.(createFocusEvent(handleElement, true));
        });
        expect(readLineHeight()).toBe('100px');

        // When more rows load, ending 400px down, and the right arrow is pressed
        addRowEndingAt(400);
        act(() => {
            getHandleProps().onKeyDown?.(createKeyboardEvent(handleElement, 'ArrowRight').event);
        });

        // Then the line reaches the new last row, instead of keeping the length measured when the edge was focused
        expect(readLineHeight()).toBe('400px');
    });

    it('focuses an edge when it is pressed, so the arrow keys reach it', () => {
        // Given a resizable column whose edge doesn't have focus
        const {handleElement, getHandleProps} = renderColumnResize();
        const focus = jest.spyOn(handleElement, 'focus');

        // When the edge is pressed, which cancels the browser's own focusing so the drag selects no text
        act(() => {
            getHandleProps().onPointerDown?.(createPointerEvent(handleElement, {clientX: 100}));
        });

        // Then the edge takes focus without scrolling the table, so a following arrow key resizes this column
        expect(focus).toHaveBeenCalledWith({preventScroll: true});
    });
});
