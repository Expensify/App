/**
 * Web column resizing by dragging a column's right edge. Widths live in CSS custom properties so React doesn't render
 * mid-drag, and the layout is saved to Onyx when the drag ends.
 */
import getDraggedSize from '@components/ResizeHandle/getDraggedSize';
import usePointerDrag from '@components/ResizeHandle/usePointerDrag';

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

    // Shared by pointerup, lost capture and cancel, so every way a drag can end keeps the width the user sees.
    const endDrag = (drag: Drag) => {
        hideIndicator();

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

    const pointerDrag = usePointerDrag<Drag>({
        dragRef,
        onMove: (drag, clientX) => {
            // The line rides the handle, so it follows the clamped width, not the pointer.
            const width = getDraggedSize(drag.startWidth, drag.startClientX, clientX, {axisSign: 1, min: dragMinWidths?.[drag.columnKey] ?? CONST.TABLES.COLUMN_RESIZE.MIN_WIDTH});

            for (const [columnKey, resizedWidth] of Object.entries(getResizedColumnWidths(drag.columnKey, width))) {
                writeColumnWidth(columnKey, resizedWidth);
            }
        },
        onEnd: (drag, event) => {
            endDrag(drag);
            syncGripHover(event);
        },
    });

    const handlePointerDown = (columnKey: string, event: React.PointerEvent<HTMLDivElement>) => {
        if (!pointerDrag.startDrag(event, {columnKey, startClientX: event.clientX, startWidth: readColumnWidth(columnKey) ?? 0})) {
            return;
        }

        revealIndicator(event.currentTarget);
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
