import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import type {ActiveSorting} from '@components/Table/middlewares/sorting';
import {useTableContext} from '@components/Table/TableContext';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

type TableSettingsPopoverComponentProps = {
    /** Function to call to close the overlay */
    closeOverlay: () => void;
};

type TableSettingsSortByPopupProps = {
    columns: Array<{key: string; label: string}>;
    pendingSorting: ActiveSorting<string>;
    setPendingSorting: React.Dispatch<React.SetStateAction<ActiveSorting<string>>>;
    onSortOrderPress: () => void;
    onBackButtonPress: () => void;
    onApply: () => void;
    onReset: () => void;
};

function TableSettingsSortByPopup({columns, pendingSorting, setPendingSorting, onSortOrderPress, onBackButtonPress, onApply, onReset}: TableSettingsSortByPopupProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const selectedColumn = columns.find((column) => column.key === pendingSorting.columnKey) ?? columns.at(0);

    const options = columns.map((column) => ({
        text: column.label,
        keyForList: column.key,
        isSelected: column.key === selectedColumn?.key,
    }));

    const updateSelectedItem = (item: ListItem) => {
        setPendingSorting((previousSorting) => ({
            ...previousSorting,
            columnKey: item.keyForList,
        }));
    };

    return (
        <BasePopup
            label={translate('search.display.sortBy')}
            onReset={onReset}
            onApply={onApply}
            onBackButtonPress={onBackButtonPress}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
        >
            <MenuItemWithTopDescription
                shouldShowRightIcon
                description={translate('search.display.sortOrder')}
                title={translate(`search.filters.sortOrder.${pendingSorting.order}`)}
                onPress={onSortOrderPress}
            />
            <View style={styles.dividerLine} />
            <SelectionList
                data={options}
                shouldSingleExecuteRowSelect
                ListItem={SingleSelectListItem}
                onSelectRow={updateSelectedItem}
                style={{contentContainerStyle: [styles.pb0]}}
            />
        </BasePopup>
    );
}

export default function TableSettingsPopoverComponent({closeOverlay}: TableSettingsPopoverComponentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {
        columns,
        activeSorting,
        initialSortColumn,
        tableMethods: {updateSorting},
    } = useTableContext();
    const [selectedSetting, setSelectedSetting] = useState<'sortBy' | 'sortOrder' | null>(null);

    const defaultSorting: ActiveSorting<string> = {
        columnKey: initialSortColumn,
        order: CONST.SEARCH.SORT_ORDER.ASC,
    };
    const [pendingSorting, setPendingSorting] = useState<ActiveSorting<string>>(defaultSorting);

    const sortableColumns = columns
        .filter((column) => column.sortable)
        .map((column) => ({
            key: column.key,
            label: column.label,
        }));

    const activeColumn = sortableColumns.find((column) => column.key === activeSorting.columnKey) ?? sortableColumns.at(0);
    const activeOrder = activeSorting.order ?? defaultSorting.order;
    const sortByTitle = activeColumn ? `${activeColumn.label} ${CONST.DOT_SEPARATOR} ${translate(`search.filters.sortOrder.${activeOrder}`)}` : undefined;

    const resetSorting = (closeSettingsMenu: () => void) => {
        setPendingSorting(defaultSorting);
        updateSorting(defaultSorting);
        setSelectedSetting(null);
        closeSettingsMenu();
    };

    const applySorting = (closeSettingsMenu: () => void) => {
        updateSorting(pendingSorting);
        setSelectedSetting(null);
        closeSettingsMenu();
    };

    const openSortBy = () => {
        setPendingSorting({
            columnKey: activeSorting.columnKey ?? defaultSorting.columnKey,
            order: activeSorting.order ?? defaultSorting.order,
        });
        setSelectedSetting('sortBy');
    };

    const closeSettingsOverlay = () => {
        setSelectedSetting(null);
        closeOverlay();
    };

    if (selectedSetting === 'sortBy') {
        return (
            <TableSettingsSortByPopup
                columns={sortableColumns}
                pendingSorting={pendingSorting}
                setPendingSorting={setPendingSorting}
                onSortOrderPress={() => setSelectedSetting('sortOrder')}
                onBackButtonPress={() => setSelectedSetting(null)}
                onApply={() => applySorting(closeSettingsOverlay)}
                onReset={() => resetSorting(closeSettingsOverlay)}
            />
        );
    }

    if (selectedSetting === 'sortOrder') {
        const selectedOrder = {
            text: translate(`search.filters.sortOrder.${pendingSorting.order}`),
            value: pendingSorting.order,
        };

        return (
            <SingleSelectPopup
                items={[
                    {text: translate(`search.filters.sortOrder.${CONST.SEARCH.SORT_ORDER.ASC}`), value: CONST.SEARCH.SORT_ORDER.ASC},
                    {text: translate(`search.filters.sortOrder.${CONST.SEARCH.SORT_ORDER.DESC}`), value: CONST.SEARCH.SORT_ORDER.DESC},
                ]}
                value={selectedOrder}
                label={translate('search.display.sortOrder')}
                defaultValue={CONST.SEARCH.SORT_ORDER.ASC}
                onBackButtonPress={() => setSelectedSetting('sortBy')}
                closeOverlay={closeSettingsOverlay}
                onChange={(item) => {
                    const nextSorting = {
                        ...pendingSorting,
                        order: item?.value ?? defaultSorting.order,
                    };
                    setPendingSorting(nextSorting);
                    updateSorting(nextSorting);
                }}
            />
        );
    }

    return (
        <ScrollView contentContainerStyle={[styles.pv4]}>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                description={translate('search.display.sortBy')}
                title={sortByTitle}
                onPress={openSortBy}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_SORT_BY}
            />
        </ScrollView>
    );
}
