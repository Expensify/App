import Icon from '@components/Icon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import type {ActiveSorting} from '@components/Table/middlewares/sorting';
import {useTableContext} from '@components/Table/TableContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

const DEFAULT_COMPANY_CARDS_SORTING: ActiveSorting<string> = {
    columnKey: 'member',
    order: CONST.SEARCH.SORT_ORDER.ASC,
};

type WorkspaceCompanyCardsPopupProps = {
    closeOverlay: () => void;
};

type WorkspaceCompanyCardsSortByPopupProps = {
    columns: Array<{key: string; label: string; sortable: boolean}>;
    pendingSorting: ActiveSorting<string>;
    setPendingSorting: React.Dispatch<React.SetStateAction<ActiveSorting<string>>>;
    onSortOrderPress: () => void;
    onBackButtonPress: () => void;
    onApply: () => void;
    onReset: () => void;
};

function WorkspaceCompanyCardsSortByPopup({columns, pendingSorting, setPendingSorting, onSortOrderPress, onBackButtonPress, onApply, onReset}: WorkspaceCompanyCardsSortByPopupProps) {
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

function WorkspaceCompanyCardsDisplayPopover({closeOverlay}: WorkspaceCompanyCardsPopupProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {
        columns,
        activeSorting,
        tableMethods: {updateSorting},
    } = useTableContext();
    const [selectedDisplayFilter, setSelectedDisplayFilter] = useState<'sortBy' | 'sortOrder' | null>(null);
    const [pendingSorting, setPendingSorting] = useState<ActiveSorting<string>>(DEFAULT_COMPANY_CARDS_SORTING);

    const sortableColumns = columns
        .filter((column) => column.sortable && column.key !== 'actions')
        .map((column) => ({
            key: column.key,
            label: column.label,
            sortable: column.sortable,
        }));

    const activeColumn = sortableColumns.find((column) => column.key === activeSorting.columnKey) ?? sortableColumns.at(0);
    const activeOrder = activeSorting.order ?? DEFAULT_COMPANY_CARDS_SORTING.order;
    const sortByTitle = activeColumn ? `${activeColumn.label} ${CONST.DOT_SEPARATOR} ${translate(`search.filters.sortOrder.${activeOrder}`)}` : undefined;

    const resetSorting = (closeDisplayMenu: () => void) => {
        setPendingSorting(DEFAULT_COMPANY_CARDS_SORTING);
        updateSorting(DEFAULT_COMPANY_CARDS_SORTING);
        setSelectedDisplayFilter(null);
        closeDisplayMenu();
    };

    const applySorting = (closeDisplayMenu: () => void) => {
        updateSorting(pendingSorting);
        setSelectedDisplayFilter(null);
        closeDisplayMenu();
    };

    const openSortBy = () => {
        setPendingSorting({
            columnKey: activeSorting.columnKey ?? DEFAULT_COMPANY_CARDS_SORTING.columnKey,
            order: activeSorting.order ?? DEFAULT_COMPANY_CARDS_SORTING.order,
        });
        setSelectedDisplayFilter('sortBy');
    };

    const closeDisplayOverlay = () => {
        setSelectedDisplayFilter(null);
        closeOverlay();
    };

    if (selectedDisplayFilter === 'sortBy') {
        return (
            <WorkspaceCompanyCardsSortByPopup
                columns={sortableColumns}
                pendingSorting={pendingSorting}
                setPendingSorting={setPendingSorting}
                onSortOrderPress={() => setSelectedDisplayFilter('sortOrder')}
                onBackButtonPress={() => setSelectedDisplayFilter(null)}
                onApply={() => applySorting(closeDisplayOverlay)}
                onReset={() => resetSorting(closeDisplayOverlay)}
            />
        );
    }

    if (selectedDisplayFilter === 'sortOrder') {
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
                onBackButtonPress={() => setSelectedDisplayFilter('sortBy')}
                closeOverlay={closeDisplayOverlay}
                onChange={(item) => {
                    const nextSorting = {
                        ...pendingSorting,
                        order: item?.value ?? DEFAULT_COMPANY_CARDS_SORTING.order,
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

function renderWorkspaceCompanyCardsDisplayPopover({closeOverlay}: WorkspaceCompanyCardsPopupProps) {
    return <WorkspaceCompanyCardsDisplayPopover closeOverlay={closeOverlay} />;
}

function WorkspaceCompanyCardsDisplayButton() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Gear']);
    const {shouldUseNarrowTableLayout} = useTableContext();

    if (shouldUseNarrowTableLayout) {
        return (
            <FilterPopupButton
                PopoverComponent={renderWorkspaceCompanyCardsDisplayPopover}
                renderButton={({ref, onPress}) => (
                    <PressableWithFeedback
                        ref={ref}
                        accessibilityLabel={translate('search.display.label')}
                        role={CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
                        hoverStyle={styles.buttonHoveredBG}
                        style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.componentSizeNormal, styles.borderRadiusCircle]}
                        onPress={onPress}
                    >
                        <Icon
                            small
                            src={icons.Gear}
                            fill={theme.icon}
                        />
                    </PressableWithFeedback>
                )}
            />
        );
    }

    return (
        <DropdownButton
            label={translate('search.display.label')}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
            value={null}
            PopoverComponent={renderWorkspaceCompanyCardsDisplayPopover}
        />
    );
}

export default WorkspaceCompanyCardsDisplayButton;
