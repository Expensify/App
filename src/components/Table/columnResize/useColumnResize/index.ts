/**
 * Web column resizing: dragging a column's right edge sets its width, paid by the columns to its right. Widths live in
 * CSS custom properties so React doesn't render mid-drag. Only the dragged column's final width is stored in Onyx.
 */
import type {AbsorberWidths} from '@components/Table/columnResize/columnResizeGestures';
import {getDraggedColumnWidth, getResizedColumnWidths} from '@components/Table/columnResize/columnResizeGestures';
import type {ResizableColumn} from '@components/Table/columnResize/types';

import {setTableColumnWidth} from '@libs/actions/TableColumnWidths';

import CONST from '@src/CONST';

import type React from 'react';

import {useEffect, useRef} from 'react';

import type {ColumnResizeController, ColumnResizeHandleDOMProps, UseColumnResizeParams} from './types';

import useLiveColumnWidths from './useLiveColumnWidths';
import useResizeIndicator from './useResizeIndicator';

/** A DOM `div` style, which the React Native style system can't type */
function getHandleStyle(columnGap: number): React.CSSProperties {
    return {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: -(columnGap / 2 + CONST.TABLES.COLUMN_RESIZE.HANDLE_HIT_WIDTH / 2),
        width: CONST.TABLES.COLUMN_RESIZE.HANDLE_HIT_WIDTH,
        cursor: CONST.TABLES.COLUMN_RESIZE.CURSOR,
        // Otherwise a touch drag on the handle is taken over by the table's own horizontal scrolling.
        touchAction: 'none',
    };
}

type Drag = {
    column: ResizableColumn;

    /** Where the pointer went down. */
    startClientX: number;

    /** The column's width when the drag started. */
    startWidth: number;

    /** Paying columns' widths when the drag started, read once so shares don't compound across moves. */
    absorberStartWidths: AbsorberWidths;
};

function useColumnResize({columnResizingID, resizableColumns, resolvedColumnWidths, dragMinWidths, columnGap}: UseColumnResizeParams): ColumnResizeController | undefined {
    const dragRef = useRef<Drag | null>(null);
    const {scopeElementRef, setScopeElement, writeColumnWidth, readColumnWidth, clearLiveWidths} = useLiveColumnWidths({resolvedColumnWidths, dragRef});
    const {revealIndicator, hideIndicator} = useResizeIndicator(scopeElementRef);

    const resetDrag = () => {
        dragRef.current = null;
        document.body.style.cursor = '';
    };

    /** Paying columns with their painted widths. Unreadable ones are skipped rather than pinned at zero. */
    const readAbsorberWidths = (column: ResizableColumn): AbsorberWidths => {
        const absorberWidths: AbsorberWidths = [];

        for (const absorber of column.absorbers) {
            const startWidth = readColumnWidth(absorber.columnKey);

            if (startWidth === undefined) {
                continue;
            }

            absorberWidths.push({...absorber, startWidth});
        }

        return absorberWidths;
    };

    // Shared by pointerup, lost capture and cancel, so every way a drag can end keeps the width the user sees.
    const endDrag = (drag: Drag) => {
        resetDrag();
        hideIndicator();

        const width = readColumnWidth(drag.column.columnKey) ?? drag.startWidth;

        // Nothing gets stored, so no render follows to clear the live widths.
        if (!columnResizingID || width === drag.startWidth) {
            clearLiveWidths();
            return;
        }

        // Only the dragged column is stored. The resolver re-derives the payers, and storing them would mark them as user-sized.
        setTableColumnWidth(columnResizingID, drag.column.columnKey, width);
    };

    const handlePointerDown = (column: ResizableColumn, event: React.PointerEvent<HTMLDivElement>) => {
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

        dragRef.current = {
            column,
            startClientX: event.clientX,
            startWidth: readColumnWidth(column.columnKey) ?? 0,
            absorberStartWidths: readAbsorberWidths(column),
        };
        document.body.style.cursor = CONST.TABLES.COLUMN_RESIZE.CURSOR;
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        const width = getDraggedColumnWidth(drag.startWidth, drag.startClientX, event.clientX, dragMinWidths?.[drag.column.columnKey]);

        // The line rides the handle, so it follows the clamped width, not the pointer.
        for (const [columnKey, resizedWidth] of Object.entries(getResizedColumnWidths(drag.column.columnKey, width, drag.startWidth, drag.absorberStartWidths))) {
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
    };

    /** Ends a drag whose pointer capture the browser reclaimed. Also fires after a normal pointerup, when it's a no-op. */
    const handleLostPointerCapture = () => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        endDrag(drag);
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
        const column = resizableColumns.find((resizableColumn) => resizableColumn.columnKey === columnKey);

        if (!column) {
            return undefined;
        }

        return {
            style: getHandleStyle(columnGap),
            onPointerDown: (event) => handlePointerDown(column, event),
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerCancel: handleLostPointerCapture,
            onLostPointerCapture: handleLostPointerCapture,
        };
    };

    return {setScopeElement, getHandleProps};
}

export default useColumnResize;
