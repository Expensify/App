import type {Dispatch, SetStateAction} from 'react';
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

    /** Set whether or not the mobile selection modal is visible */
    setIsMobileSelectionModalVisible: Dispatch<SetStateAction<boolean>>;
};

type UseSelectionResult<DataType extends TableData> = MiddlewareHookResult<DataType, SelectionMethods, TableRow<DataType>> & {
    /** Whether or not the mobile selection modal is visible */
    isMobileSelectionModalVisible: boolean;
};

export default function useSelection<DataType extends TableData>({data, onRowSelectionChange}: UseSelectionProps<DataType>): UseSelectionResult<DataType> {
    const lastSelectedRowKeyRef = useRef<string | null>(null);
    const lastSelectedRowIsSelectedRef = useRef<boolean>(false);

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [isMobileSelectionModalVisible, setIsMobileSelectionModalVisible] = useState(false);

    const selectableKeys = data.filter((item) => !item.disabled).map((item) => item.keyForList);

    let areAllSelectableRowsSelected = true;
    const tableRowData: Array<TableRow<DataType>> = [];

    for (const item of data) {
        const isSelected = selectedKeys.includes(item.keyForList);
        tableRowData.push({...item, selected: isSelected});

        if (!isSelected && !item.disabled) {
            areAllSelectableRowsSelected = false;
        }
    }

    /**
     * Helper method to ensure that the row selection callback is called every time that the selected
     * keys are updated
     */
    const updateSelectedKeys: Dispatch<SetStateAction<string[]>> = (action) => {
        setSelectedKeys((prevSelectedKeys) => {
            const updatedSelectedKeys = typeof action === 'function' ? action(prevSelectedKeys) : action;

            if (onRowSelectionChange) {
                const selectedRows = tableRowData.filter((row) => updatedSelectedKeys.includes(row.keyForList));
                onRowSelectionChange(selectedRows);
            }

            return updatedSelectedKeys;
        });
    };

    /**
     * Clear all of the currently selected keys
     */
    const clearSelection = () => {
        updateSelectedKeys([]);
    };

    /**
     * When the select all checkbox is toggled, select or deselect all of the
     * rows in the table
     */
    const handleSelectAll = () => {
        if (areAllSelectableRowsSelected) {
            updateSelectedKeys([]);
        } else {
            updateSelectedKeys(selectableKeys);
        }
    };

    /**
     * When a single row is selected in the table, update the selection state to toggle the selection either
     * on or off
     */
    const handleSingleRowSelection = (keyForList: string) => {
        updateSelectedKeys((prevSelectedKeys) => {
            const keyIndex = prevSelectedKeys.indexOf(keyForList);
            const isCurrentlySelected = keyIndex !== -1;

            lastSelectedRowKeyRef.current = keyForList;
            lastSelectedRowIsSelectedRef.current = !isCurrentlySelected;

            if (isCurrentlySelected) {
                return [...prevSelectedKeys.slice(0, keyIndex), ...prevSelectedKeys.slice(keyIndex + 1)];
            }

            return [...prevSelectedKeys, keyForList];
        });
    };

    /**
     * When a row is selected, while holding shift, select all of the rows in-between
     * the last selected row and the current row
     */
    const handleMultipleRowSelection = (keyForList: string) => {
        const keyForListExists = selectableKeys.includes(keyForList);

        if (!keyForListExists) {
            return;
        }

        const lastSelectedRowKey = lastSelectedRowKeyRef.current;
        const lastSelectedRowIsSelected = lastSelectedRowIsSelectedRef.current;

        if (!lastSelectedRowKey) {
            handleSingleRowSelection(keyForList);
            return;
        }

        const currentSelectedRowIndex = selectableKeys.indexOf(keyForList);
        const lastSelectedRowIndex = selectableKeys.indexOf(lastSelectedRowKey);

        if (currentSelectedRowIndex === -1 || lastSelectedRowIndex === -1) {
            handleSingleRowSelection(keyForList);
            return;
        }

        const endIndex = Math.max(currentSelectedRowIndex, lastSelectedRowIndex);
        const startIndex = Math.min(currentSelectedRowIndex, lastSelectedRowIndex);

        updateSelectedKeys((prevSelectedKeys) => {
            const newSelectedKeys = [...prevSelectedKeys];

            for (let i = startIndex; i <= endIndex; i++) {
                const key = selectableKeys.at(i);

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
        return tableRowData;
    };

    return {
        middleware,
        isMobileSelectionModalVisible,
        methods: {
            handleSelectAll,
            handleMultipleRowSelection,
            handleSingleRowSelection,
            clearSelection,
            setIsMobileSelectionModalVisible,
        },
    };
}

export type {SelectionMethods, UseSelectionProps, UseSelectionResult};
