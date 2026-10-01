import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Persists a dragged column's width once the drag ends. The drag itself only touches CSS. */
function setTableColumnWidth(columnResizingID: string, columnKey: string, width: number) {
    Onyx.merge(ONYXKEYS.TABLE_COLUMN_WIDTHS, {[columnResizingID]: {[columnKey]: width}});
}

// eslint-disable-next-line import/prefer-default-export
export {setTableColumnWidth};
