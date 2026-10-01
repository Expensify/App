import type ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxValues} from '@src/ONYXKEYS';

import type {OnyxEntry} from 'react-native-onyx';

type TableColumnWidths = OnyxValues[typeof ONYXKEYS.TABLE_COLUMN_WIDTHS];

/** One table's stored widths. Narrowing keeps a drag in one table from re-rendering every other table. */
const tableColumnWidthsSelector = (columnResizingID: string | undefined) => (tableColumnWidths: OnyxEntry<TableColumnWidths>) =>
    columnResizingID ? tableColumnWidths?.[columnResizingID] : undefined;

// eslint-disable-next-line import/prefer-default-export
export {tableColumnWidthsSelector};
