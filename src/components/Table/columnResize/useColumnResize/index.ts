/**
 * Web column resizing: dragging a column's right edge sets its width, clicking it fits the content, double-clicking it
 * resets it. Widths live in CSS custom properties so React doesn't render mid-drag. Only the column's final width is stored in Onyx.
 */
import getDraggedColumnWidth from '@components/Table/columnResize/getDraggedColumnWidth';

import useThemeStyles from '@hooks/useThemeStyles';

import {clearTableColumnWidth, setTableColumnWidth} from '@libs/actions/TableColumnWidths';

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

    /** Whether the pointer passed the drag slop. Until then, releasing it is a click. */
    hasMovedPointer: boolean;

    /** Whether the pointer went down while a click on this edge was waiting to fit, so releasing it is a double-click. */
    isSecondClick: boolean;
};

/** A click waiting out the double-click interval before it fits its column. */
type PendingFit = {
    columnKey: string;

    timeoutID: ReturnType<typeof setTimeout>;
};

function useColumnResize({
    columnResizingID,
    resizableColumnKeys,
    resolvedColumnWidths,
    dragMinWidths,
    fitColumnWidths,
    columnWidthOverrides,
    columnGap,
}: UseColumnResizeParams): ColumnResizeController | undefined {
    const styles = useThemeStyles();
    const dragRef = useRef<Drag | null>(null);
    const {scopeElementRef, setScopeElement, writeColumnWidth, readColumnWidth, clearLiveWidths} = useLiveColumnWidths({resolvedColumnWidths, dragRef});
    const {revealIndicator, hideIndicator} = useResizeIndicator(scopeElementRef);

    // Fitting on the first click would move the edge before the second click, which would then land on the heading and sort it.
    const pendingFitRef = useRef<PendingFit | null>(null);

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

    const fitColumnToContent = (columnKey: string) => {
        const contentWidth = fitColumnWidths?.[columnKey];

        if (!columnResizingID || contentWidth === undefined) {
            return;
        }

        const width = Math.max(Math.round(contentWidth), CONST.TABLES.COLUMN_RESIZE.MIN_WIDTH);

        // The last column stretches into leftover room, so it can be drawn wider than its stored width. Compare against the
        // stored width too, or an already-fitted last column looks unfitted and gets re-stored with no render to follow.
        if (columnWidthOverrides?.[columnKey] === width || readColumnWidth(columnKey) === width) {
            return;
        }

        writeColumnWidth(columnKey, width);
        setTableColumnWidth(columnResizingID, columnKey, width);
    };

    const resetColumnWidth = (columnKey: string) => {
        if (!columnResizingID) {
            return;
        }

        clearTableColumnWidth(columnResizingID, columnKey);
    };

    const scheduleFit = (columnKey: string) => {
        const timeoutID = setTimeout(() => {
            pendingFitRef.current = null;
            fitColumnToContent(columnKey);
        }, CONST.TABLES.COLUMN_RESIZE.DOUBLE_CLICK_INTERVAL);

        pendingFitRef.current = {columnKey, timeoutID};
    };

    /** Stops a waiting click. Returns the column it would have fitted. */
    const cancelPendingFit = (): string | undefined => {
        const pendingFit = pendingFitRef.current;

        if (!pendingFit) {
            return undefined;
        }

        clearTimeout(pendingFit.timeoutID);
        pendingFitRef.current = null;

        return pendingFit.columnKey;
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

        const pendingFitColumnKey = cancelPendingFit();
        const isSecondClick = pendingFitColumnKey === columnKey;

        // A click on another edge isn't a double-click, so the waiting one fits now, before this press reads its width.
        if (pendingFitColumnKey && !isSecondClick) {
            fitColumnToContent(pendingFitColumnKey);
        }

        dragRef.current = {
            columnKey,
            startClientX: event.clientX,
            startWidth: readColumnWidth(columnKey) ?? 0,
            hasMovedPointer: false,
            isSecondClick,
        };
        // On the whole page mid-drag, so the cursor doesn't flicker once the pointer outruns the handle.
        document.body.style.cursor = styles.cursorColResize.cursor ?? '';
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        // Nothing is painted inside the slop, so a click fits from the width the column already had. A mouse click rarely
        // lands on the exact pixel it started from.
        if (!drag.hasMovedPointer) {
            if (Math.abs(event.clientX - drag.startClientX) <= CONST.TABLES.COLUMN_RESIZE.DRAG_SLOP) {
                return;
            }

            // Kept once set, so a drag that comes back to where it started isn't a click. Clicks never show the line.
            drag.hasMovedPointer = true;
            revealIndicator(event.currentTarget);
        }

        // The line rides the handle, so it follows the clamped width, not the pointer.
        writeColumnWidth(drag.columnKey, getDraggedColumnWidth(drag.startWidth, drag.startClientX, event.clientX, dragMinWidths?.[drag.columnKey]));
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        if (drag.hasMovedPointer) {
            endDrag(drag);
            return;
        }

        resetDrag();

        if (drag.isSecondClick) {
            resetColumnWidth(drag.columnKey);
            return;
        }

        scheduleFit(drag.columnKey);
    };

    /** Ends a drag whose pointer capture the browser reclaimed. Also fires after a normal pointerup, when it's a no-op. */
    const handleLostPointerCapture = () => {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        endDrag(drag);
    };

    // Unmounting would otherwise fit a column that's gone, or mid-drag leave the resize cursor on the document.
    useEffect(
        () => () => {
            cancelPendingFit();

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
