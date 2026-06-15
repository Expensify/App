import type {Dispatch, SetStateAction} from 'react';
import {useEffect, useRef, useState} from 'react';
import type {TableData, TableRow} from '@components/Table/types';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import type {MiddlewareHookResult} from './types';

type UseSelectionProps<DataType extends TableData> = {
    /** The data being used in the table */
    data: DataType[];

    /** The number of non-disabled items in the original (pre-search/filter) data */
    originalSelectableCount: number;

    /** The list of selected keys */
    selectedKeys: string[];

    /** Callback that is fired when the selection of rows in the table changes */
    onRowSelectionChange?: (selectedRowKeys: string[]) => void;
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
    setMobileSelectionModalRowKey: Dispatch<SetStateAction<string | null>>;
};

type UseSelectionResult<DataType extends TableData> = MiddlewareHookResult<DataType, SelectionMethods, TableRow<DataType>> & {
    /** Whether or not the mobile selection modal is visible */
    mobileSelectionModalRowKey: string | null;
};

export default function useSelection<DataType extends TableData>({
    data,
    originalSelectableCount,
    selectedKeys,
    onRowSelectionChange,
}: UseSelectionProps<DataType>): UseSelectionResult<DataType> {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isSelectionModeEnabled = useMobileSelectionMode();
    const lastSelectedRowKeyRef = useRef<string | null>(null);
    const lastSelectedRowIsSelectedRef = useRef<boolean>(false);

    // When a user long-presses a row on mobile, store the key of the row that will be selected if
    // the user confirms the selection
    const [mobileSelectionModalRowKey, setMobileSelectionModalRowKey] = useState<string | null>(null);

    const selectableKeys = data.filter((item) => !item.disabled).map((item) => item.keyForList);
    const tableRowData: Array<TableRow<DataType>> = data.map((item) => ({...item, selected: selectedKeys.includes(item.keyForList)}));

    // Automatically disable selection mode when switching to desktop, or enable it when switching to mobile if there are selected rows
    useEffect(() => {
        if (shouldUseNarrowLayout && !isSelectionModeEnabled && selectedKeys.length) {
            turnOnMobileSelectionMode();
        } else if (!shouldUseNarrowLayout && isSelectionModeEnabled && !selectedKeys.length) {
            turnOffMobileSelectionMode();
        }
    }, [shouldUseNarrowLayout, isSelectionModeEnabled, selectedKeys.length]);

    // When there are genuinely no selectable items left, turn off selection mode on mobile.
    // Stay in selection mode as long as the original data has non-disabled items (they may be hidden by search/filter).
    useEffect(() => {
        if (selectableKeys.length || !isSelectionModeEnabled || originalSelectableCount > 0) {
            return;
        }

        turnOffMobileSelectionMode();
    }, [selectableKeys.length, isSelectionModeEnabled, originalSelectableCount]);

    const prevSelectionModeEnabledRef = useRef(isSelectionModeEnabled);
    useEffect(() => {
        if (prevSelectionModeEnabledRef.current && !isSelectionModeEnabled) {
            onRowSelectionChange?.([]);
        }
        prevSelectionModeEnabledRef.current = isSelectionModeEnabled;
    }, [isSelectionModeEnabled, onRowSelectionChange]);

    /**
     * Clear all of the currently selected keys
     */
    const clearSelection = () => {
        onRowSelectionChange?.([]);
    };

    /**
     * When the select all checkbox is toggled, select or deselect all of the
     * rows in the table
     */
    const handleSelectAll = () => {
        const areAllSelectableRowsSelected = selectableKeys.every((key) => selectedKeys.includes(key));

        const isSelectionEmpty = selectedKeys.length === 0;
        const isSelectionFull = areAllSelectableRowsSelected;
        const isSelectionIndeterminate = selectedKeys.length > 0 && !areAllSelectableRowsSelected;

        if (isSelectionEmpty) {
            onRowSelectionChange?.(selectableKeys);
        } else if (isSelectionFull || isSelectionIndeterminate) {
            onRowSelectionChange?.([]);
        }
    };

    /**
     * When a single row is selected in the table, update the selection state to toggle the selection either
     * on or off
     */
    const handleSingleRowSelection = (keyForList: string) => {
        const keyIndex = selectedKeys.indexOf(keyForList);
        const isCurrentlySelected = keyIndex !== -1;

        lastSelectedRowKeyRef.current = keyForList;
        lastSelectedRowIsSelectedRef.current = !isCurrentlySelected;

        if (isCurrentlySelected) {
            onRowSelectionChange?.([...selectedKeys.slice(0, keyIndex), ...selectedKeys.slice(keyIndex + 1)]);
            return;
        }

        onRowSelectionChange?.([...selectedKeys, keyForList]);
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

        const newSelectedKeys = [...selectedKeys];

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

        onRowSelectionChange?.(newSelectedKeys);
    };

    const middleware = () => {
        return tableRowData;
    };

    return {
        middleware,
        mobileSelectionModalRowKey,
        methods: {
            handleSelectAll,
            handleMultipleRowSelection,
            handleSingleRowSelection,
            clearSelection,
            setMobileSelectionModalRowKey,
        },
    };
}

export type {SelectionMethods, UseSelectionProps, UseSelectionResult};
