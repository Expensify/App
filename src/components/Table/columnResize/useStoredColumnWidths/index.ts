import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import {tableColumnWidthsSelector} from '@src/selectors/TableColumnWidths';
import type {ColumnWidthOverrides} from '@src/types/onyx/TableColumnWidths';

/** Widths the user dragged in tables sharing this `columnResizingID`. */
function useStoredColumnWidths(columnResizingID: string): ColumnWidthOverrides | undefined {
    const [columnWidthOverrides] = useOnyx(ONYXKEYS.TABLE_COLUMN_WIDTHS, {selector: tableColumnWidthsSelector(columnResizingID)});
    return columnWidthOverrides;
}

export default useStoredColumnWidths;
