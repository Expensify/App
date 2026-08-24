import type {TableColumn, TableData} from './types';

/**
 * Builds the CSS grid track list that lays out a table's columns on wide layouts.
 *
 * A column with a fixed `width` gets a `px` track. Every other column gets an `fr` track sized by its
 * `styling.flex`, so a column can claim a larger share of the leftover space than its siblings.
 */
function getGridTemplateColumns<ColumnKey extends string = string, DataType extends TableData = TableData>(columns: Array<TableColumn<ColumnKey, DataType>>): string[] {
    return columns.map((column) => (column.width ? `${column.width}px` : `${column.styling?.flex ?? 1}fr`));
}

export default getGridTemplateColumns;
