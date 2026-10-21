/**
 * Web column resizing by dragging a column's right edge. Widths live in CSS custom properties so React doesn't render
 * mid-drag, and the layout is saved to Onyx when the drag ends.
 */
import {SCROLL_EXTENT_FLOOR_VARIABLE} from '@components/Table/columnResize/columnWidthExpressions';
import getDraggedColumnWidth from '@components/Table/columnResize/getDraggedColumnWidth';

import useThemeStyles from '@hooks/useThemeStyles';

import {setTableColumnWidths} from '@libs/actions/TableColumnWidths';

import CONST from '@src/CONST';

import type React from 'react';

import {useEffect, useRef} from 'react';

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
        width: columnGap + CONST.TABLES.COLUMN_RESIZE.INDICATOR_WIDTH,
        // Otherwise a touch drag on the handle is taken over by the table's own horizontal scrolling.
        touchAction: 'none',
    };
}

type Drag = {
    columnKey: string;

    /** Where the pointer went down. */
    startClientX: number;

    /** The column's width when the drag started. */
    startWidth: number;
};

function useColumnResize({
    columnResizingID,
    resizableColumnKeys,
    getResizedColumnWidths,
    resolvedColumnWidths,
    dragMinWidths,
    getStoredTableColumnWidths,
    columnGap,
}: UseColumnResizeParams): ColumnResizeController | undefined {
    const styles = useThemeStyles();
    const dragRef = useRef<Drag | null>(null);
    const {scopeElementRef, setScopeElement, writeColumnWidth, readColumnWidth, clearLiveWidths} = useLiveColumnWidths({resolvedColumnWidths, dragRef});
    const {revealIndicator, hideIndicator} = useResizeIndicator(scopeElementRef);

    const resetDrag = () => {
        dragRef.current = null;
        document.body.style.cursor = '';
    };

    // Shared by pointerup, lost capture and cancel, so every way a drag can end keeps the width the user sees.
    const endDrag = (drag: Drag) => {
        resetDrag();
        hideIndicator();
        scopeElementRef.current?.style.removeProperty(SCROLL_EXTENT_FLOOR_VARIABLE);

        const width = readColumnWidth(drag.columnKey) ?? drag.startWidth;

        // Nothing gets stored, so no render follows to clear the live widths.
        if (!columnResizingID || !getStoredTableColumnWidths || width === drag.startWidth) {
            clearLiveWidths();
            return;
        }

        const paintedColumnWidths = Object.fromEntries(Object.keys(resolvedColumnWidths).map((columnKey) => [columnKey, readColumnWidth(columnKey) ?? 0]));
        setTableColumnWidths(columnResizingID, getStoredTableColumnWidths(paintedColumnWidths, drag.columnKey));
    };

    // Releasing or losing capture doesn't reliably fire boundary events, so hit-test the heading, including the handle overhanging it.
    const syncGripHover = (event: React.PointerEvent<HTMLDivElement>) => {
        const isPointerOnHeading = !!event.currentTarget.parentElement?.contains(document.elementFromPoint(event.clientX, event.clientY));

        setGripHovered(event.currentTarget, isPointerOnHeading);
    };

    const handlePointerDown = (columnKey: string, event: React.PointerEvent<HTMLDivElement>) => {
        // Secondary buttons open context menus rather than dragging.
        if (event.button !== 0) {
            return;
        }

        // Keeps the drag from selecting the header's labels, and from reaching the column's sort button underneath.
        event.preventDefault();
        event.stopPropagation();

        // Keeps the drag on this handle once the pointer moves off it.
        event.currentTarget.setPointerCapture(event.pointerId);

        revealIndicator(event.currentTarget);

        // Shrinking a column while scrolled right would otherwise drag the pinned filter bar along with the columns.
        const scroller = event.currentTarget.closest<HTMLElement>('[data-table-column-scroller="true"]');
        if (scroller) {
            scopeElementRef.current?.style.setProperty(SCROLL_EXTENT_FLOOR_VARIABLE, `${scroller.scrollLeft + scroller.clientWidth}px`);
        }

        dragRef.current = {
            columnKey,
            startClientX: event.clientX,
            startWidth: readColumnWidth(columnKey) ?? 0,
        };
        // On the whole page mid-drag, so the cursor doesn't flicker once the pointer outruns the handle.
        document.body.style.cursor = styles.cursorColResize.cursor ?? '';
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        // The line rides the handle, so it follows the clamped width, not the pointer.
        const width = getDraggedColumnWidth(drag.startWidth, drag.startClientX, event.clientX, dragMinWidths?.[drag.columnKey]);

        for (const [columnKey, resizedWidth] of Object.entries(getResizedColumnWidths(drag.columnKey, width))) {
            writeColumnWidth(columnKey, resizedWidth);
        }
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        endDrag(drag);
        syncGripHover(event);
    };

    /** Ends a drag whose pointer capture the browser reclaimed. Also fires after a normal pointerup, when it's a no-op. */
    const handleLostPointerCapture = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        endDrag(drag);
        syncGripHover(event);
    };

    // Unmounting mid-drag would otherwise leave the resize cursor on the document and a dangling drag.
    useEffect(
        () => () => {
            if (!dragRef.current) {
                return;
            }

            resetDrag();
        },
        [],
    );

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
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerCancel: handleLostPointerCapture,
            onLostPointerCapture: handleLostPointerCapture,
        };
    };

    return {setScopeElement, getHandleProps};
}

export default useColumnResize;
