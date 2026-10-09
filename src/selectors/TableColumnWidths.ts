import type {TableColumnWidths} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

/** One table's stored widths. Narrowing keeps a drag in one table from re-rendering every other table. */
const tableColumnWidthsSelector = (columnResizingID: string) => (tableColumnWidths: OnyxEntry<TableColumnWidths>) => tableColumnWidths?.[columnResizingID];

const hasTableColumnWidthsSelector = (columnResizingID: string | undefined) => (tableColumnWidths: OnyxEntry<TableColumnWidths>) =>
    !!columnResizingID && !isEmptyObject(tableColumnWidthsSelector(columnResizingID)(tableColumnWidths));

export {tableColumnWidthsSelector, hasTableColumnWidthsSelector};
