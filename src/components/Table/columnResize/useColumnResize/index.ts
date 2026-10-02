/**
 * Web column resizing: dragging a column's right edge sets its width. Widths live in CSS custom properties so React
 * doesn't render mid-drag. Only the dragged column's final width is stored in Onyx.
 */
import {getDraggedColumnWidth} from '@components/Table/columnResize/columnResizeGestures';

import {setTableColumnWidth} from '@libs/actions/TableColumnWidths';

import CONST from '@src/CONST';

import type React from 'react';

import {useEffect, useRef} from 'react';

import type {ColumnResizeController, ColumnResizeHandleDOMProps, UseColumnResizeParams} from './types';

import useLiveColumnWidths from './useLiveColumnWidths';
import useResizeIndicator from './useResizeIndicator';

const {HANDLE_HIT_WIDTH, CURSOR} = CONST.TABLES.COLUMN_RESIZE;

type Drag = {
    columnKey: string;

    /** Where the pointer went down. */
    startClientX: number;

    /** The column's width when the drag started. */
    startWidth: number;
};

function useColumnResize({columnResizingID, resizableColumnKeys, resolvedColumnWidths, columnGap}: UseColumnResizeParams): ColumnResizeController | undefined {
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

        const width = readColumnWidth(drag.columnKey) ?? drag.startWidth;

        // Nothing gets stored, so no render follows to clear the live widths.
        if (!columnResizingID || width === drag.startWidth) {
            clearLiveWidths();
            return;
        }

        setTableColumnWidth(columnResizingID, drag.columnKey, width);
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

        dragRef.current = {
            columnKey,
            startClientX: event.clientX,
            startWidth: readColumnWidth(columnKey) ?? 0,
        };
        document.body.style.cursor = CURSOR;
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        // The line rides the handle, so it follows the clamped width, not the pointer.
        writeColumnWidth(drag.columnKey, getDraggedColumnWidth(drag.startWidth, drag.startClientX, event.clientX));
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
    useEffect(() => resetDrag, []);

    if (!columnResizingID || resizableColumnKeys.length === 0) {
        return undefined;
    }

    const getHandleProps = (columnKey: string): ColumnResizeHandleDOMProps | undefined => {
        if (!resizableColumnKeys.includes(columnKey)) {
            return undefined;
        }

        return {
            style: {
                position: 'absolute',
                top: 0,
                bottom: 0,
                // Centred in the gap after the column. There's always a next column since the last one is headless.
                right: -(columnGap / 2 + HANDLE_HIT_WIDTH / 2),
                width: HANDLE_HIT_WIDTH,
                cursor: CURSOR,
                // Otherwise a touch drag on the handle is taken over by the table's own horizontal scrolling.
                touchAction: 'none',
            },
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
