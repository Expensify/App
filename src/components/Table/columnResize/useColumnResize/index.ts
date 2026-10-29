/**
 * Web column resizing: dragging a column's right edge sets its width, and clicking it toggles between fitting the content
 * and resetting it. Widths live in CSS custom properties so React doesn't render mid-drag, and the layout is saved to Onyx once
 * the column settles.
 */
import getDraggedSize from '@components/ResizeHandle/getDraggedSize';
import usePointerDrag from '@components/ResizeHandle/usePointerDrag';
import {SCROLL_EXTENT_FLOOR_VARIABLE, TABLE_COLUMN_SCROLLER_SELECTOR} from '@components/Table/columnResize/columnWidthExpressions';

import useThemeStyles from '@hooks/useThemeStyles';

import {setTableColumnWidths} from '@libs/actions/TableColumnWidths';

import CONST from '@src/CONST';

import type React from 'react';

import {useRef} from 'react';

import type {ColumnResizeController, ColumnResizeHandleDOMProps, UseColumnResizeParams} from './types';

import useLiveColumnWidths from './useLiveColumnWidths';
import useResizeIndicator, {setGripHovered, trackHeadingHover} from './useResizeIndicator';

/** A DOM `div` style, which the React Native style system can't type */
function getHandleStyle(columnGap: number): React.CSSProperties {
    return {
        position: 'absolute',
        top: 0,
        bottom: 0,
        // Spans the gap to the next column, with the grip and the line flush against this column's edge, so they read as part of the column being resized.
        right: -columnGap,
        width: columnGap + CONST.RESIZE_HANDLE.INDICATOR_WIDTH,
        // Otherwise a touch drag on the handle is taken over by the table's own horizontal scrolling.
        touchAction: 'none',
    };
}

type Drag = {
    columnKey: string;

    /** The handle the pointer went down on, which holds the pointer capture. */
    handle: HTMLDivElement;

    /** Where the pointer went down. */
    startClientX: number;

    /** The column's width when the drag started. */
    startWidth: number;

    /** Whether the pointer passed the drag slop. Until then, releasing it is a click. */
    hasMovedPointer: boolean;
};

function useColumnResize({
    columnResizingID,
    resizableColumnKeys = [],
    // Only reached once a column's edge drags, which needs the layout that brings the real one.
    getResizedColumnWidths = (columnKey, width) => ({[columnKey]: width}),
    resolvedColumnWidths = CONST.EMPTY_OBJECT,
    dragMinWidths,
    getStoredTableColumnWidths,
    getTargetColumnWidth,
    columnGap,
}: UseColumnResizeParams): ColumnResizeController | undefined {
    const styles = useThemeStyles();
    const dragRef = useRef<Drag | null>(null);
    const {scopeElementRef, setScopeElement, writeColumnWidth, readColumnWidth, clearLiveWidths} = useLiveColumnWidths({resolvedColumnWidths, dragRef});
    const {revealIndicator, hideIndicator} = useResizeIndicator(scopeElementRef);

    const readPaintedColumnWidths = () => Object.fromEntries(Object.keys(resolvedColumnWidths).map((columnKey) => [columnKey, readColumnWidth(columnKey) ?? 0]));

    const writeColumnWidths = (columnWidths: Record<string, number>) => {
        for (const [columnKey, width] of Object.entries(columnWidths)) {
            writeColumnWidth(columnKey, width);
        }
    };

    /** Paints the column at `width`, its absorbers taking the change, and saves the layout with it marked resized or handed back. */
    const settleColumn = (columnKey: string, width: number, isResized: boolean) => {
        // Nothing gets stored, so no render follows to clear the live widths.
        if (!columnResizingID || !getStoredTableColumnWidths) {
            clearLiveWidths();
            return;
        }

        const resizedColumnWidths = getResizedColumnWidths(columnKey, width);
        const storedTableColumnWidths = getStoredTableColumnWidths({...readPaintedColumnWidths(), ...resizedColumnWidths}, columnKey, isResized);

        // A cleared layout reflows every column, and clearing one that was never saved renders nothing that would undo the paint.
        if (storedTableColumnWidths) {
            writeColumnWidths(resizedColumnWidths);
        }

        setTableColumnWidths(columnResizingID, storedTableColumnWidths);
    };

    // Shared by pointerup, lost capture and cancel, so every way a drag can end keeps the width the user sees.
    const endDrag = (drag: Drag) => {
        hideIndicator();
        scopeElementRef.current?.style.removeProperty(SCROLL_EXTENT_FLOOR_VARIABLE);

        const width = readColumnWidth(drag.columnKey) ?? drag.startWidth;

        // Nothing gets stored when the width doesn't change, so no render would follow to clear the live widths.
        if (width === drag.startWidth) {
            clearLiveWidths();
            return;
        }

        settleColumn(drag.columnKey, width, true);
    };

    // Releasing or losing capture doesn't reliably fire boundary events, so hit-test the heading, including the handle overhanging it.
    const syncGripHover = (event: React.PointerEvent<HTMLDivElement>) => {
        const isPointerOnHeading = !!event.currentTarget.parentElement?.contains(document.elementFromPoint(event.clientX, event.clientY));

        setGripHovered(event.currentTarget, isPointerOnHeading);
    };

    /** Fits the column to its content, or resets it when it already fits, so clicking an edge again undoes the fit. */
    const toggleColumnFit = (columnKey: string) => {
        const fitWidth = getTargetColumnWidth?.(columnKey, CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET.FIT);

        // A column that can't be fitted has nothing to toggle between.
        if (fitWidth === undefined) {
            return;
        }

        if (readColumnWidth(columnKey) !== fitWidth) {
            settleColumn(columnKey, fitWidth, true);
            return;
        }

        const resetWidth = getTargetColumnWidth?.(columnKey, CONST.TABLES.COLUMN_RESIZE.WIDTH_TARGET.RESET);

        if (resetWidth === undefined) {
            return;
        }

        settleColumn(columnKey, resetWidth, false);
    };

    const pointerDrag = usePointerDrag<Drag>({
        dragRef,
        onMove: (drag, clientX) => {
            // Nothing is painted inside the slop, so a click fits from the width the column already had. A mouse click rarely
            // lands on the exact pixel it started from.
            if (!drag.hasMovedPointer) {
                if (Math.abs(clientX - drag.startClientX) <= CONST.TABLES.COLUMN_RESIZE.DRAG_SLOP) {
                    return;
                }

                // Kept once set, so a drag that comes back to where it started isn't a click. Clicks never show the line.
                // eslint-disable-next-line no-param-reassign -- the drag is this hook's own state, held in its ref
                drag.hasMovedPointer = true;
                revealIndicator(drag.handle);

                // Shrinking a column while scrolled right would otherwise drag the pinned filter bar along with the columns.
                // Only endDrag clears it, so a click, whose fit or reset may shrink the table, must never set it.
                const scroller = drag.handle.closest<HTMLElement>(TABLE_COLUMN_SCROLLER_SELECTOR);
                if (scroller) {
                    scopeElementRef.current?.style.setProperty(SCROLL_EXTENT_FLOOR_VARIABLE, `${scroller.scrollLeft + scroller.clientWidth}px`);
                }
            }

            // The line rides the handle, so it follows the clamped width, not the pointer.
            const width = getDraggedSize(drag.startWidth, clientX - drag.startClientX, {min: dragMinWidths?.[drag.columnKey] ?? CONST.TABLES.COLUMN_RESIZE.MIN_WIDTH});

            writeColumnWidths(getResizedColumnWidths(drag.columnKey, width));
        },
        onEnd: (drag, event, isRelease) => {
            // A cancelled press or reclaimed capture isn't a click, so only a release fits or resets.
            if (drag.hasMovedPointer || !isRelease) {
                endDrag(drag);
            } else {
                toggleColumnFit(drag.columnKey);
            }

            syncGripHover(event);
        },
    });

    const handlePointerDown = (columnKey: string, event: React.PointerEvent<HTMLDivElement>) => {
        const handle = event.currentTarget;

        pointerDrag.startDrag(event, () => ({columnKey, handle, startClientX: event.clientX, startWidth: readColumnWidth(columnKey) ?? 0, hasMovedPointer: false}));
    };

    if (!columnResizingID) {
        return undefined;
    }

    const getHandleProps = (columnKey: string): ColumnResizeHandleDOMProps | undefined => {
        if (!resizableColumnKeys.includes(columnKey)) {
            return undefined;
        }

        return {
            style: {...getHandleStyle(columnGap), ...styles.cursorColResize},
            ref: trackHeadingHover,
            onPointerDown: (event) => handlePointerDown(columnKey, event),
            ...pointerDrag.handlers,
        };
    };

    return {setScopeElement, getHandleProps};
}

export default useColumnResize;
