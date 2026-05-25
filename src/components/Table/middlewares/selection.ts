import {useRef, useState} from 'react';
import type {TableData, TableRow} from '@components/Table/types';
import type {MiddlewareHookResult} from './types';

type UseSelectionProps<DataType extends TableData> = {
    /** The data being used in the table */
    data: DataType[];

    /** Callback that is fired when the selection of rows in the table changes */
    onRowSelectionChange?: (selectedRows: Array<TableRow<DataType>>) => void;
};

type SelectionMethods = {
    /** Callback to either select or unselect all rows in the table */
    handleSelectAll: () => void;

    /** Callback to select multiple rows in the table, while holding shift and clicking on a row */
    handleMultipleRowSelection: (keyForList: string) => void;

    /** Callback to select a single row in the table */
    handleSingleRowSelection: (keyForList: string) => void;

    /** Clear all of the currently selected rows in the table */
    clearSelection: () => void;
};

type UseSelectionResult<DataType extends TableData> = MiddlewareHookResult<DataType, SelectionMethods, TableRow<DataType>>;

export default function useSelection<DataType extends TableData>({data, onRowSelectionChange}: UseSelectionProps<DataType>): UseSelectionResult<DataType> {
    const keyForLists = data.map((item) => item.keyForList);
    const disabledKeyForLists = data.filter((item) => item.disabled).map((item) => item.keyForList);

    const lastSelectedRowKeyRef = useRef<string | null>(null);
    const lastSelectedRowIsSelectedRef = useRef<boolean>(false);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    let areAllActiveRowsSelected = true;
    const modifiedData: Array<TableRow<DataType>> = [];

    for (const item of data) {
        const isSelected = selectedKeys.includes(item.keyForList);
        modifiedData.push({...item, selected: isSelected});

        if (!isSelected && !item.disabled) {
            areAllActiveRowsSelected = false;
        }
    }

    /**
     * Helper method to ensure that the row selection callback is called every time that the selected
     * keys are updated
     */
    const updateSelectedKeys = (action: (previousSelectedKeys: string[]) => string[]) => {
        setSelectedKeys((previousSelectedKeys) => {
            const modifiedSelectedKeys = action(previousSelectedKeys).filter((key) => !disabledKeyForLists.includes(key));

            if (onRowSelectionChange) {
                const visibleSelectedRows = modifiedData.filter((row) => modifiedSelectedKeys.includes(row.keyForList));
                onRowSelectionChange(visibleSelectedRows);
            }

            return modifiedSelectedKeys;
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
        if (areAllActiveRowsSelected) {
            updateSelectedKeys(() => []);
        } else {
            updateSelectedKeys(() => keyForLists);
        }
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
            }

            return [...prevSelectedKeys, keyForList];
        });
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
                const key = keyForLists.at(i);

                if (!key) {
                    continue;
                }

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

export type {SelectionMethods, UseSelectionProps, UseSelectionResult};
