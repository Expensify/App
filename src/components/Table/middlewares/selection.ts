import {Dispatch, SetStateAction, useRef, useState} from 'react';
import {TableData, TableRow} from '../types';
import {MiddlewareHookResult} from './types';

export type UseSelectionProps<DataType extends TableData> = {
    /** The data being used in the table */
    data: DataType[];

    /** Callback that is fired when the selection of rows in the table changes */
    onRowSelectionChange?: (selectedRows: TableRow<DataType>[]) => void;
};

export type SelectionMethods = {
    /** Callback to either select or unselect all rows in the table */
    handleSelectAll: () => void;

    /** Callback to select multiple rows in the table, while holding shift and clicking on a row */
    handleMultipleRowSelection: (keyForList: string) => void;

    /** Callback to select a single row in the table */
    handleSingleRowSelection: (keyForList: string) => void;

    /** Clear all of the currently selected rows in the table */
    clearSelection: () => void;
};

export type UseSelectionResult<DataType extends TableData> = MiddlewareHookResult<DataType, SelectionMethods, TableRow<DataType>>;

export default function useSelection<DataType extends TableData>({data, onRowSelectionChange}: UseSelectionProps<DataType>): UseSelectionResult<DataType> {
    const keyForLists = data.map((item) => item.keyForList);

    const lastSelectedRowKeyRef = useRef<string | null>(null);
    const lastSelectedRowIsSelectedRef = useRef<boolean>(false);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    let areAllRowsSelected = true;
    let modifiedData: TableRow<DataType>[] = [];

    for (const item of data) {
        const isSelected = selectedKeys.includes(item.keyForList);
        modifiedData.push({...item, selected: isSelected});

        if (!isSelected) {
            areAllRowsSelected = false;
        }
    }

    /**
     * Helper method to ensure that the row selection callback is called every time that the selected
     * keys are updated
     */
    const updateSelectedKeys = (action: (previousSelectedKeys: string[]) => string[]) => {
        setSelectedKeys((previousSelectedKeys) => {
            const updatedValue = action(previousSelectedKeys);

            if (onRowSelectionChange) {
                const visibleSelectedRows = modifiedData.filter((row) => updatedValue.includes(row.keyForList));
                onRowSelectionChange(visibleSelectedRows);
            }

            return updatedValue;
        });
    };

    /**
     * Clear all of the currently selected keys
     */
    const clearSelection = () => {
        updateSelectedKeys(() => []);
    };

    /**
     * When the select all checkbox is toggled, select or deselect all of the
     * rows in the table
     */
    const handleSelectAll = () => {
        if (areAllRowsSelected) {
            updateSelectedKeys(() => []);
        } else {
            updateSelectedKeys(() => keyForLists);
        }
    };

    /**
     * When a row is selected, while holding shift, select all of the rows in-between
     * the last selected row and the current row
     */
    const handleMultipleRowSelection = (keyForList: string) => {
        const keyForListExists = keyForLists.includes(keyForList);

        if (!keyForListExists) {
            return;
        }

        const lastSelectedRowKey = lastSelectedRowKeyRef.current;
        const lastSelectedRowIsSelected = lastSelectedRowIsSelectedRef.current;

        if (!lastSelectedRowKey) {
            handleSingleRowSelection(keyForList);
            return;
        }

        const currentSelectedRowIndex = keyForLists.indexOf(keyForList);
        const lastSelectedRowIndex = keyForLists.indexOf(lastSelectedRowKey);

        if (currentSelectedRowIndex === -1 || lastSelectedRowIndex === -1) {
            handleSingleRowSelection(keyForList);
            return;
        }

        const startIndex = Math.min(currentSelectedRowIndex, lastSelectedRowIndex);
        const endIndex = Math.max(currentSelectedRowIndex, lastSelectedRowIndex);

        updateSelectedKeys((prevSelectedKeys) => {
            const newSelectedKeys = [...prevSelectedKeys];

            for (let i = startIndex; i <= endIndex; i++) {
                const key = keyForLists[i];
                if (lastSelectedRowIsSelected) {
                    if (!newSelectedKeys.includes(key)) {
                        newSelectedKeys.push(key);
                    }
                } else {
                    const index = newSelectedKeys.indexOf(key);
                    if (index !== -1) {
                        newSelectedKeys.splice(index, 1);
                    }
                }
            }

            return newSelectedKeys;
        });
    };

    /**
     * When a single row is selected in the table, update the selection state
     */
    const handleSingleRowSelection = (keyForList: string) => {
        lastSelectedRowKeyRef.current = keyForList;
        lastSelectedRowIsSelectedRef.current = !selectedKeys.includes(keyForList);

        updateSelectedKeys((prevSelectedKeys) => {
            if (prevSelectedKeys.includes(keyForList)) {
                return prevSelectedKeys.filter((key) => key !== keyForList);
            } else {
                return [...prevSelectedKeys, keyForList];
            }
        });
    };

    const middleware = () => {
        return modifiedData;
    };

    return {
        middleware,
        methods: {
            handleSelectAll,
            handleMultipleRowSelection,
            handleSingleRowSelection,
            clearSelection,
        },
    };
}
