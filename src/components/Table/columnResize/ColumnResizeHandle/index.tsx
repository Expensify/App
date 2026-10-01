import {RESIZE_INDICATOR_HEIGHT_VARIABLE, RESIZE_INDICATOR_OPACITY_VARIABLE, RESIZE_INDICATOR_TOP_VARIABLE} from '@components/Table/columnResize/columnWidthExpressions';
import type {ColumnResizeHandleProps} from '@components/Table/columnResize/types';

import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import React from 'react';

const {INDICATOR_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/**
 * Drag strip over a column's right edge, inside its header cell. Carries the line drawn down the table while this edge
 * is hovered or dragged, so it moves with the column on its own, through drags and sideways scrolls alike.
 * Renders nothing for non-draggable columns. A plain `div` because it relies on DOM pointer capture and focus handling.
 */
function ColumnResizeHandle({columnResize, columnKey}: ColumnResizeHandleProps) {
    const theme = useTheme();
    const column = columnResize?.columns.find((resizableColumn) => resizableColumn.columnKey === columnKey);

    if (!columnResize || !column) {
        return null;
    }

    return (
        <div {...columnResize.getHandleProps(column)}>
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    // Runs from the heading row's top to the lowest row's bottom; neither matches the handle's box, so the handle measures and writes both.
                    top: `var(${RESIZE_INDICATOR_TOP_VARIABLE}, 0px)`,
                    height: `var(${RESIZE_INDICATOR_HEIGHT_VARIABLE}, 100%)`,
                    left: '50%',
                    marginLeft: -INDICATOR_WIDTH / 2,
                    width: INDICATOR_WIDTH,
                    backgroundColor: theme.iconMenu,
                    opacity: `var(${RESIZE_INDICATOR_OPACITY_VARIABLE}, 0)`,
                    // The handle owns the pointer; this is only ever a picture of where the edge is.
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

export default ColumnResizeHandle;
