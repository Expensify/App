import type {TableColumnWidths} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/** One table's stored widths. Narrowing keeps a drag in one table from re-rendering every other table. */
const tableColumnWidthsSelector = (columnResizingID: string | undefined) => (tableColumnWidths: OnyxEntry<TableColumnWidths>) =>
    columnResizingID ? tableColumnWidths?.[columnResizingID] : undefined;

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {tableColumnWidthsSelector};
