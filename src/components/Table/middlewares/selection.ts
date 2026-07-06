import type {TableData, TableRow} from '@components/Table/types';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShiftRangeSelection from '@hooks/useShiftRangeSelection';

import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {applyShiftRangeBatchToKeySet} from '@libs/shiftRangeSelection';

import type {Dispatch, SetStateAction} from 'react';

import {useCallback, useEffect, useState} from 'react';

import type {MiddlewareHookResult} from './types';

type UseSelectionProps<DataType extends TableData> = {
    /** The data being used in the table */
    data: DataType[];

    /** The number of non-disabled items in the original (pre-search/filter) data */
    originalSelectableCount: number;

    /** The list of selected keys */
    selectedKeys: string[];

    /** The list of actively applied filters */
    currentFilters: Record<string, unknown>;

    /** Callback that is fired when the selection of rows in the table changes */
    onRowSelectionChange?: (selectedRowKeys: string[]) => void;

    /** Whether the selection mode should key off the real screen size instead of shouldUseNarrowLayout (for tables inside a narrow pane modal / RHP) */
    shouldEnableSelectionInNarrowPaneModal?: boolean;
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
    currentFilters,
    onRowSelectionChange,
    shouldEnableSelectionInNarrowPaneModal,
}: UseSelectionProps<DataType>): UseSelectionResult<DataType> {
    // When a table opts into selection inside a narrow pane modal (RHP), the selection-mode auto-sync keys off the real
    // screen size (isSmallScreenWidth) so it behaves correctly there (shouldUseNarrowLayout is always true in an RHP).
    // Otherwise it keeps the original shouldUseNarrowLayout behavior, so central-pane tables are unaffected.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const selectionUsesNarrowLayout = shouldEnableSelectionInNarrowPaneModal ? isSmallScreenWidth : shouldUseNarrowLayout;
    const isSelectionModeEnabled = useMobileSelectionMode();

    // When a user long-presses a row on mobile, store the key of the row that will be selected if
    // the user confirms the selection
    const [mobileSelectionModalRowKey, setMobileSelectionModalRowKey] = useState<string | null>(null);

    const selectableKeys = data.filter((item) => !item.disabled && !item.isSelectionDisabled).map((item) => item.keyForList);
    const tableRowData: Array<TableRow<DataType>> = data.map((item) => ({...item, selected: selectedKeys.includes(item.keyForList)}));

    // Shares the app-wide shift-range hook so Tables match the SelectionList surfaces.
    const rangeApi = useShiftRangeSelection<DataType>({
        items: data,
        getItemKey: (item) => item.keyForList,
        getSelectedKeys: () => selectedKeys,
        isDisabledItem: (item) => !!item.disabled || !!item.isSelectionDisabled,
        onApplyRange: (batch) =>
            onRowSelectionChange?.(
                applyShiftRangeBatchToKeySet(
                    batch,
                    selectedKeys,
                    (item) => item.keyForList,
                    (item) => !item.disabled && !item.isSelectionDisabled,
                ),
            ),
    });

    const clearSelection = useCallback(() => {
        onRowSelectionChange?.([]);
        rangeApi.clearAnchor();
    }, [onRowSelectionChange, rangeApi]);

    // Disable selection mode when the Android hardware back button is pressed
    const androidBackButtonDisableSelectionMode = useCallback(() => {
        if (!isSelectionModeEnabled) {
            return false;
        }

        clearSelection();
        turnOffMobileSelectionMode();
        return true;
    }, [isSelectionModeEnabled, clearSelection]);

    useAndroidBackButtonHandler(androidBackButtonDisableSelectionMode);

    // Sync the selection mode with the screen size & selection state
    useEffect(() => {
        const isMobileMissingSelectionMode = selectionUsesNarrowLayout && !isSelectionModeEnabled && selectedKeys.length;
        const isDesktopWithoutSelectableKeys = isSelectionModeEnabled && !selectableKeys.length && !selectionUsesNarrowLayout;
        const isSelectionModeEnabledWithoutSelectableKeys = isSelectionModeEnabled && !selectableKeys.length && !originalSelectableCount;

        if (isMobileMissingSelectionMode) {
            turnOnMobileSelectionMode();
        } else if (isDesktopWithoutSelectableKeys || isSelectionModeEnabledWithoutSelectableKeys) {
            turnOffMobileSelectionMode();
        }
    }, [selectionUsesNarrowLayout, isSelectionModeEnabled, selectedKeys.length, originalSelectableCount, selectableKeys.length]);

    // When selection mode is turned off, clear the list of selected keys, so that re-enabling selection mode doesn't retain rows
    const wasSelectionModeEnabled = usePrevious(isSelectionModeEnabled);
    useEffect(() => {
        if (!wasSelectionModeEnabled || isSelectionModeEnabled) {
            return;
        }

        clearSelection();
    }, [isSelectionModeEnabled, selectedKeys.length, clearSelection, wasSelectionModeEnabled]);

    // When the table filters change, clear the current selection
    useEffect(() => clearSelection(), [currentFilters, clearSelection]);

    // When the table unmounts, clear the selection. Should only run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => () => onRowSelectionChange?.([]), []);

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
            rangeApi.seedFullRange();
        } else if (isSelectionFull || isSelectionIndeterminate) {
            onRowSelectionChange?.([]);
            rangeApi.clearAnchor();
        }
    };

    /**
     * When a single row is selected in the table, update the selection state to toggle the selection either
     * on or off
     */
    const handleSingleRowSelection = (keyForList: string) => {
        if (!selectableKeys.includes(keyForList)) {
            return;
        }

        const item = data.find((row) => row.keyForList === keyForList);
        if (item) {
            rangeApi.notifyAnchor(item);
        }

        const keyIndex = selectedKeys.indexOf(keyForList);
        const isCurrentlySelected = keyIndex !== -1;

        if (isCurrentlySelected) {
            onRowSelectionChange?.([...selectedKeys.slice(0, keyIndex), ...selectedKeys.slice(keyIndex + 1)]);
            return;
        }

        if (item?.disabled || item?.isSelectionDisabled) {
            return;
        }

        onRowSelectionChange?.([...selectedKeys, keyForList]);
    };

    // Shift+click: select the range between the anchor and this row.
    const handleMultipleRowSelection = (keyForList: string) => {
        const item = data.find((row) => row.keyForList === keyForList);

        if (!item || item.disabled || item.isSelectionDisabled) {
            return;
        }

        if (rangeApi.applyShiftClick(item, true)) {
            return;
        }

        handleSingleRowSelection(keyForList);
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
