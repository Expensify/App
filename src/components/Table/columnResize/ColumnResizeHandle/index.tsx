import {RESIZE_INDICATOR_HEIGHT_VARIABLE, RESIZE_INDICATOR_OPACITY_VARIABLE, RESIZE_INDICATOR_TOP_VARIABLE} from '@components/Table/columnResize/columnWidthExpressions';
import type {ColumnResizeHandleProps} from '@components/Table/columnResize/types';
import {useTableContext} from '@components/Table/TableContext';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

// A DOM `div` style, which the React Native style system can't type because of the custom property expressions.
const INDICATOR_STYLE: React.CSSProperties = {
    position: 'absolute',
    // Spans heading row to lowest row, which the handle's box doesn't match, so both are measured.
    top: `var(${RESIZE_INDICATOR_TOP_VARIABLE}, 0px)`,
    height: `var(${RESIZE_INDICATOR_HEIGHT_VARIABLE}, 100%)`,
    left: '50%',
    marginLeft: -CONST.TABLES.COLUMN_RESIZE.INDICATOR_WIDTH / 2,
    width: CONST.TABLES.COLUMN_RESIZE.INDICATOR_WIDTH,
    opacity: `var(${RESIZE_INDICATOR_OPACITY_VARIABLE}, 0)`,
    pointerEvents: 'none',
};

/**
 * Drag the strip over a column's right edge. Carries the indicator line, so it moves with the column through drags and scrolls.
 * A plain `div` because it relies on DOM pointer capture.
 */
function ColumnResizeHandle({columnKey}: ColumnResizeHandleProps) {
    const styles = useThemeStyles();
    const {columnResize} = useTableContext();
    const handleProps = columnResize?.getHandleProps(columnKey);

    if (!handleProps) {
        return null;
    }

    return (
        <div {...handleProps}>
            <div
                aria-hidden
                style={{...INDICATOR_STYLE, ...styles.tableColumnResizeIndicator}}
            />
        </div>
    );
}

export default ColumnResizeHandle;
