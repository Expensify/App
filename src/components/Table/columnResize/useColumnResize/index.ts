import {getDraggedColumnWidth} from '@components/Table/columnResize/columnResizeGestures';
import type {ResizableColumn} from '@components/Table/columnResize/types';

import {setTableColumnWidth} from '@libs/actions/TableColumnWidths';

import CONST from '@src/CONST';

import type React from 'react';

import {useEffect, useRef} from 'react';

import type {ColumnResizeController, ColumnResizeHandleDOMProps, UseColumnResizeParams} from './types';

import useLiveColumnWidths from './useLiveColumnWidths';
import useResizeIndicator from './useResizeIndicator';

const {HANDLE_HIT_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

type Drag = {
    column: ResizableColumn;

    /** Where the pointer went down. */
    startClientX: number;

    /** The column's width when the drag started. */
    startWidth: number;
};

/**
 * Web column resizing: dragging a column's right edge sets its width. Widths live in CSS custom properties so React
 * doesn't render mid-drag. Only the dragged column's final width is stored in Onyx.
 */
function useColumnResize({columnResizingID, columns, resolvedColumnWidths, columnWidthOverrides, columnGap}: UseColumnResizeParams): ColumnResizeController | undefined {
    const dragRef = useRef<Drag | null>(null);
    const {scopeElementRef, setScopeElement, writeColumnWidth, readColumnWidth, clearLiveWidths} = useLiveColumnWidths({resolvedColumnWidths, columnWidthOverrides, dragRef});
    const {revealIndicator, hideIndicator} = useResizeIndicator(scopeElementRef, dragRef);

    /** Forgets the drag and restores the cursor, without committing. */
    const resetDrag = () => {
        dragRef.current = null;
        document.body.style.cursor = '';
    };

    /** Stores the width. Clears live widths right away when nothing is stored, since no render follows to clear them. */
    const commitColumnWidth = (columnKey: string, width: number) => {
        if (!columnResizingID || columnWidthOverrides?.[columnKey] === width) {
            clearLiveWidths();
            return;
        }

        setTableColumnWidth(columnResizingID, columnKey, width);
    };

    /** Ends the drag and stores its width. Shared by pointerup, lost capture and cancel. */
    const endDrag = (drag: Drag) => {
        resetDrag();

        const width = readColumnWidth(drag.column.columnKey) ?? drag.startWidth;

        if (width === drag.startWidth) {
            clearLiveWidths();
            return;
        }

        commitColumnWidth(drag.column.columnKey, width);
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
        };
        document.body.style.cursor = 'col-resize';
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        // The line rides the handle, so it follows the clamped width, not the pointer.
        writeColumnWidth(drag.column.columnKey, getDraggedColumnWidth(drag.startWidth, drag.startClientX, event.clientX));
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

        // Releasing capture doesn't reliably fire pointerleave, so hit-test the moved handle instead.
        const handleRect = event.currentTarget.getBoundingClientRect();
        const isPointerStillOnHandle = event.clientX >= handleRect.left && event.clientX <= handleRect.right && event.clientY >= handleRect.top && event.clientY <= handleRect.bottom;

        if (!isPointerStillOnHandle) {
            hideIndicator();
        }
    };

    /** Ends a drag whose pointer capture the browser reclaimed. Also fires after a normal pointerup, when it's a no-op. */
    const handleLostPointerCapture = () => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        endDrag(drag);
        hideIndicator();
    };

    // Unmounting mid-drag would otherwise leave the resize cursor on the document and a dangling drag.
    useEffect(() => resetDrag, []);

    if (!columnResizingID || columns.length === 0) {
        return undefined;
    }

    const getHandleProps = (column: ResizableColumn): ColumnResizeHandleDOMProps => ({
        style: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            // Centred in the gap after the column. There's always a next column since the last one is headless.
            right: -(columnGap / 2 + HANDLE_HIT_WIDTH / 2),
            width: HANDLE_HIT_WIDTH,
            cursor: 'col-resize',
            // Otherwise a touch drag on the handle is taken over by the table's own horizontal scrolling.
            touchAction: 'none',
        },
        onPointerDown: (event) => handlePointerDown(column, event),
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handleLostPointerCapture,
        onLostPointerCapture: handleLostPointerCapture,
        onPointerEnter: (event) => revealIndicator(event.currentTarget),
        onPointerLeave: hideIndicator,
    });

    return {setScopeElement, columns, getHandleProps};
}

export default useColumnResize;
