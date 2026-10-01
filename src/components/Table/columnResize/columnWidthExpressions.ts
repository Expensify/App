/**
 * CSS custom properties resizable tables read widths from, plus expressions over them. A drag rewrites one property
 * and the browser repaints, so React doesn't render mid-drag.
 */

import type {DimensionValue, ViewStyle} from 'react-native';

/** Prefix of the custom property a resizable column reads its width from. */
const COLUMN_WIDTH_VARIABLE_PREFIX = '--table-column-width-';

/** Custom property a handle's line reads its top from: the heading row's top, relative to the handle. */
const RESIZE_INDICATOR_TOP_VARIABLE = '--table-resize-indicator-top';

/** Custom property a handle's line reads its height from: the heading row's top down to the lowest drawn row's bottom. */
const RESIZE_INDICATOR_HEIGHT_VARIABLE = '--table-resize-indicator-height';

/** Custom property a handle's line reads its opacity from, set on that handle alone so hovering an edge never re-renders the table. */
const RESIZE_INDICATOR_OPACITY_VARIABLE = '--table-resize-indicator-opacity';

/** Marks the header row and the data rows, so the line can find where the table's rows start and end. */
const TABLE_ROW_DATA_SET = {tableRow: true};

const TABLE_ROW_SELECTOR = '[data-table-row]';

/** Custom property name for a column's width. Invalid CSS name characters in the key are replaced. */
function getColumnWidthVariableName(columnKey: string): string {
    return `${COLUMN_WIDTH_VARIABLE_PREFIX}${columnKey.replaceAll(/[^\w-]/g, '_')}`;
}

/** A resizable column's width: its custom property, falling back to the resolved width (what paints before a drag writes it). */
function getColumnWidthValue(columnKey: string, resolvedWidth: number): string {
    return `var(${getColumnWidthVariableName(columnKey)}, ${resolvedWidth}px)`;
}

/**
 * Track for the column absorbing the row's leftover width: at least its resolved width, growing into unused space.
 * Keeps trailing headless columns (arrow, menu, icon) pinned to the right edge when earlier columns narrow.
 */
function getGrowableColumnTrack(widthValue: string): string {
    return `minmax(${widthValue}, 1fr)`;
}

/**
 * Sum of the columns plus chrome as a CSS expression, floored at `floor` so the table stays full-width and overflow scrolls.
 * `floor` isn't always `100%` because a row's containing block includes its margin, so `100%` would overhang there.
 */
function getColumnsWidthExpression(columnWidthValues: string[], chromeWidth: number, floor: string): string {
    if (columnWidthValues.length === 0) {
        return `max(${floor}, ${chromeWidth}px)`;
    }

    return `max(${floor}, calc(${columnWidthValues.join(' + ')} + ${chromeWidth}px))`;
}

/** Casts a px number or `calc()` string to a width style; `DimensionValue` can't type arbitrary CSS expressions. */
function getColumnsWidthStyle(width: number | string): ViewStyle {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see above
    return {width: width as DimensionValue};
}

/** `minWidth` counterpart of `getColumnsWidthStyle`, for holding a scroller's content open at the columns' width. */
function getColumnsMinWidthStyle(minWidth: number | string): ViewStyle {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see `getColumnsWidthStyle`
    return {minWidth: minWidth as DimensionValue};
}

export {
    RESIZE_INDICATOR_HEIGHT_VARIABLE,
    RESIZE_INDICATOR_OPACITY_VARIABLE,
    RESIZE_INDICATOR_TOP_VARIABLE,
    TABLE_ROW_DATA_SET,
    TABLE_ROW_SELECTOR,
    getColumnWidthValue,
    getColumnWidthVariableName,
    getColumnsMinWidthStyle,
    getColumnsWidthExpression,
    getColumnsWidthStyle,
    getGrowableColumnTrack,
};
