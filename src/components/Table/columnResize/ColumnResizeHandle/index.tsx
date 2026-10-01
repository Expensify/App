import {RESIZE_INDICATOR_HEIGHT_VARIABLE, RESIZE_INDICATOR_OPACITY_VARIABLE, RESIZE_INDICATOR_TOP_VARIABLE} from '@components/Table/columnResize/columnWidthExpressions';
import type {ColumnResizeHandleProps} from '@components/Table/columnResize/types';

import useTheme from '@hooks/useTheme';

import CONST from '@src/CONST';

import React from 'react';

const {INDICATOR_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/**
 * Drag the strip over a column's right edge. Carries the indicator line, so it moves with the column through drags and scrolls.
 * A plain `div` because it relies on DOM pointer capture.
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
                    // Spans heading row to lowest row, which the handle's box doesn't match, so both are measured.
                    top: `var(${RESIZE_INDICATOR_TOP_VARIABLE}, 0px)`,
                    height: `var(${RESIZE_INDICATOR_HEIGHT_VARIABLE}, 100%)`,
                    left: '50%',
                    marginLeft: -INDICATOR_WIDTH / 2,
                    width: INDICATOR_WIDTH,
                    backgroundColor: theme.iconMenu,
                    opacity: `var(${RESIZE_INDICATOR_OPACITY_VARIABLE}, 0)`,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

export default ColumnResizeHandle;
