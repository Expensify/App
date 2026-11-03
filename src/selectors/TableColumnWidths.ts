import type {TableColumnWidths} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/** Narrowed to one table, so a drag doesn't re-render every other table. */
const tableColumnWidthsSelector = (columnResizingID: string) => (tableColumnWidths: OnyxEntry<TableColumnWidths>) => tableColumnWidths?.[columnResizingID];

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {tableColumnWidthsSelector};
