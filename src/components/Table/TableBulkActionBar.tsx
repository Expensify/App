import BulkActionBar from '@components/BulkActionBar';
import type {BulkActionBarProps} from '@components/BulkActionBar/types';

import React from 'react';

import type {TableData} from './types';

import {useTableContext} from './TableContext';

type TableBulkActionBarProps<TValueType> = Omit<BulkActionBarProps<TValueType>, 'selectedCount' | 'onClearSelection'> & {
    /** Replaces what the bar's close button does, which is otherwise to clear the table's own selection. */
    onClearSelection?: () => void;
};

/**
 * The floating bulk action bar for the table's selection. Render it as a child of `<Table>` and it mounts itself
 * whenever the wide layout has rows selected, with the list reserving the space it floats over.
 */
function TableBulkActionBar<TValueType>({onClearSelection, ...bulkActionBarProps}: TableBulkActionBarProps<TValueType>) {
    const {selectedKeys, tableMethods, isBulkActionBarVisible} = useTableContext<TableData>();

    if (!isBulkActionBarVisible) {
        return null;
    }

    return (
        <BulkActionBar
            selectedCount={selectedKeys.length}
            onClearSelection={onClearSelection ?? tableMethods.clearSelection}
            {...bulkActionBarProps}
        />
    );
}

export default TableBulkActionBar;
