import Hoverable from '@components/Hoverable';
import {
    RESIZE_GRIP_HOVER_VARIABLE,
    RESIZE_INDICATOR_DATA_ATTRIBUTE,
    RESIZE_INDICATOR_HEIGHT_VARIABLE,
    RESIZE_INDICATOR_OPACITY_VARIABLE,
    RESIZE_INDICATOR_TOP_VARIABLE,
} from '@components/Table/columnResize/columnWidthExpressions';
import type {ColumnResizeHandleProps} from '@components/Table/columnResize/types';
import {useTableContext} from '@components/Table/TableContext';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

// DOM `div` styles, which the React Native style system can't type because of the custom property expressions.
// Both bars sit at the handle's left, which is flush against the column's edge.
const BAR_STYLE: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: CONST.RESIZE_HANDLE.INDICATOR_WIDTH,
};

const GRIP_STYLE: React.CSSProperties = {
    ...BAR_STYLE,
    top: `${((1 - CONST.TABLES.COLUMN_RESIZE.GRIP_HEIGHT_RATIO) / 2) * 100}%`,
    height: `${CONST.TABLES.COLUMN_RESIZE.GRIP_HEIGHT_RATIO * 100}%`,
    borderRadius: CONST.RESIZE_HANDLE.INDICATOR_WIDTH / 2,
    // Hidden while the line shows, since the line grew out of it.
    opacity: `calc(var(${RESIZE_GRIP_HOVER_VARIABLE}, 0) * (1 - var(${RESIZE_INDICATOR_OPACITY_VARIABLE}, 0)))`,
    transition: `opacity ${CONST.TABLES.COLUMN_RESIZE.INDICATOR_MORPH_DURATION}ms`,
};

const INDICATOR_STYLE: React.CSSProperties = {
    ...BAR_STYLE,
    // Spans heading row to lowest row, which the handle's box doesn't match, so both are measured.
    top: `var(${RESIZE_INDICATOR_TOP_VARIABLE}, 0px)`,
    height: `var(${RESIZE_INDICATOR_HEIGHT_VARIABLE}, 100%)`,
    opacity: `var(${RESIZE_INDICATOR_OPACITY_VARIABLE}, 0)`,
    // Keeps its height while hidden, so it would otherwise hand the rows below the header to the handle.
    pointerEvents: 'none',
};

/**
 * Drag the strip over a column's right edge. Carries the grip and the indicator line, so they move with the column through drags and scrolls.
 * A plain `div` because it relies on DOM pointer capture.
 */
function ColumnResizeHandle({columnKey}: ColumnResizeHandleProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {columnResize} = useTableContext();
    const handleProps = columnResize?.getHandleProps(columnKey);

    if (!handleProps) {
        return null;
    }

    return (
        <Hoverable>
            {(isHovered) => (
                <div {...handleProps}>
                    <div
                        aria-hidden
                        // Takes the line's color while the handle itself is hovered, hinting that dragging grows it into the line.
                        style={{...GRIP_STYLE, backgroundColor: isHovered ? theme.iconMenu : theme.border}}
                    />
                    <div
                        aria-hidden
                        {...{[RESIZE_INDICATOR_DATA_ATTRIBUTE]: true}}
                        style={{...INDICATOR_STYLE, ...styles.resizeIndicator}}
                    />
                </div>
            )}
        </Hoverable>
    );
}

export default ColumnResizeHandle;
