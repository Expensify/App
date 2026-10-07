import {useTableContext} from '@components/Table/TableContext';

import useOnyx from '@hooks/useOnyx';

import {resetTableColumnWidths} from '@libs/actions/TableColumnWidths';

import ONYXKEYS from '@src/ONYXKEYS';
import {hasTableColumnWidthsSelector} from '@src/selectors/TableColumnWidths';

/** Drops the table's stored widths. `undefined` while resizing is off or no column has been resized. */
function useColumnWidthsReset(): (() => void) | undefined {
    const {columnResizingID} = useTableContext();
    const [hasColumnWidthOverrides] = useOnyx(ONYXKEYS.TABLE_COLUMN_WIDTHS, {selector: hasTableColumnWidthsSelector(columnResizingID)});

    if (!columnResizingID || !hasColumnWidthOverrides) {
        return undefined;
    }

    return () => resetTableColumnWidths(columnResizingID);
}

export default useColumnWidthsReset;
