/** CSS custom properties resizable tables read widths from, so a drag repaints without a React render. */

/** Prefix of the custom property a resizable column reads its width from. */
const COLUMN_WIDTH_VARIABLE_PREFIX = '--table-column-width-';

/** Top of a handle's line: the heading row's top, relative to the handle. */
const RESIZE_INDICATOR_TOP_VARIABLE = '--table-resize-indicator-top';

/** Height of a handle's line: heading row's top to the lowest drawn row's bottom. */
const RESIZE_INDICATOR_HEIGHT_VARIABLE = '--table-resize-indicator-height';

/** Opacity of a handle's line, set on that handle so hovering never re-renders the table. */
const RESIZE_INDICATOR_OPACITY_VARIABLE = '--table-resize-indicator-opacity';

/** Marks the header row and the data rows, so the line can find where the table's rows start and end. */
const TABLE_ROW_DATA_SET = {tableRow: true};

const TABLE_ROW_SELECTOR = '[data-table-row]';

/** Column keys may hold characters a CSS custom property name can't, so those are replaced. */
function getColumnWidthVariableName(columnKey: string): string {
    return `${COLUMN_WIDTH_VARIABLE_PREFIX}${columnKey.replaceAll(/[^\w-]/g, '_')}`;
}

/** A column's width custom property, falling back to its resolved width. */
function getColumnWidthValue(columnKey: string, resolvedWidth: number): string {
    return `var(${getColumnWidthVariableName(columnKey)}, ${resolvedWidth}px)`;
}

/** Track that grows into the row's leftover width, keeping trailing headless columns pinned right. */
function getGrowableColumnTrack(widthValue: string): string {
    return `minmax(${widthValue}, 1fr)`;
}

/** CSS sum of the columns plus chrome, floored at `floor` so the table stays full-width and overflow scrolls. */
function getColumnsWidthExpression(columnWidthValues: string[], chromeWidth: number, floor: string): string {
    if (columnWidthValues.length === 0) {
        return `max(${floor}, ${chromeWidth}px)`;
    }

    return `max(${floor}, calc(${columnWidthValues.join(' + ')} + ${chromeWidth}px))`;
}

export {
    RESIZE_INDICATOR_HEIGHT_VARIABLE,
    RESIZE_INDICATOR_OPACITY_VARIABLE,
    RESIZE_INDICATOR_TOP_VARIABLE,
    TABLE_ROW_DATA_SET,
    TABLE_ROW_SELECTOR,
    getColumnWidthValue,
    getColumnWidthVariableName,
    getColumnsWidthExpression,
    getGrowableColumnTrack,
};
