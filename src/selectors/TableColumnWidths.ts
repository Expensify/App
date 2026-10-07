import type {TableColumnWidths} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

/** One table's stored widths. Narrowing keeps a drag in one table from re-rendering every other table. */
const tableColumnWidthsSelector = (columnResizingID: string | undefined) => (tableColumnWidths: OnyxEntry<TableColumnWidths>) =>
    columnResizingID ? tableColumnWidths?.[columnResizingID] : undefined;

const hasTableColumnWidthsSelector = (columnResizingID: string | undefined) => (tableColumnWidths: OnyxEntry<TableColumnWidths>) =>
    !isEmptyObject(tableColumnWidthsSelector(columnResizingID)(tableColumnWidths));

export {tableColumnWidthsSelector, hasTableColumnWidthsSelector};
