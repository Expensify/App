import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DraggableList from '@components/DraggableList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {SearchCustomColumnIds} from '@components/Search/types';
import type {ListItem} from '@components/SelectionList/types';
import MultiSelectListItem from '@components/SelectionListWithSections/MultiSelectListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import {getCustomColumnDefault, getCustomColumns, getSearchColumnTranslationKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

type ColumnItem = {
    text: string;
    value: SearchCustomColumnIds;
    keyForList: SearchCustomColumnIds;
    isSelected: boolean;
    isDisabled: boolean;
    isDragDisabled: boolean;
    leftElement: React.JSX.Element;
};

function SearchColumnsPage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DragHandles']);
    const {translate, localeCompare} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const groupBy = searchAdvancedFiltersForm?.groupBy;
    const queryType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    const allTypeCustomColumns = getCustomColumns(queryType);
    const allGroupCustomColumns = getCustomColumns(groupBy);
    const defaultGroupCustomColumns = getCustomColumnDefault(groupBy);
    const defaultTypeCustomColumns = getCustomColumnDefault(queryType);

    const allCustomColumns = [...allGroupCustomColumns, ...allTypeCustomColumns];
    const defaultCustomColumns = new Set([...defaultGroupCustomColumns, ...defaultTypeCustomColumns]);

    // We need at least one element with flex1 in the table to ensure the table looks good in the UI, so we don't allow removing the total columns
    // since it makes sense for them to show up in an expense management App and it fixes the layout issues.
    const requiredColumns = new Set<SearchCustomColumnIds>([
        CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
        CONST.SEARCH.TABLE_COLUMNS.TOTAL,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_CARD,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_FROM,
        CONST.SEARCH.TABLE_COLUMNS.GROUP_MERCHANT,
    ]);

    const sortColumns = (columnsToSort: ColumnItem[]): ColumnItem[] => {
        const selected = columnsToSort.filter((col) => col.isSelected);
        const unselected = columnsToSort
            .filter((col) => !col.isSelected)
            .sort((a, b) => {
                const keyA = getSearchColumnTranslationKey(a.value);
                const keyB = getSearchColumnTranslationKey(b.value);
                const textA = keyA ? translate(keyA) : '';
                const textB = keyB ? translate(keyB) : '';
                return localeCompare(textA, textB);
            });
        return [...selected, ...unselected];
    };

    const defaultColumns = allCustomColumns.map((columnId) => ({
        columnId,
        isSelected: defaultCustomColumns.has(columnId),
    }));

    const [columns, setColumns] = useState(() => {
        const selectedColumnIds = searchAdvancedFiltersForm?.columns?.filter((columnId) => allCustomColumns.includes(columnId)) ?? [];

        if (!selectedColumnIds.length) {
            return defaultColumns;
        }

        const selected = selectedColumnIds.map((columnId) => ({columnId, isSelected: true}));
        const unselected = allCustomColumns.filter((columnId) => !selectedColumnIds.includes(columnId)).map((columnId) => ({columnId, isSelected: false}));

        return [...selected, ...unselected];
    });

    const selectedColumnIds = columns.filter((col) => col.isSelected).map((col) => col.columnId);

    const allColumnsList = sortColumns(
        columns.map(({columnId, isSelected}) => {
            const isRequired = requiredColumns.has(columnId);
            const isEffectivelySelected = isRequired || isSelected;
            const isDragDisabled = !isEffectivelySelected;
            const translationKey = getSearchColumnTranslationKey(columnId);
            return {
                text: translationKey ? translate(translationKey) : '',
                value: columnId,
                keyForList: columnId,
                isSelected: isEffectivelySelected,
                isDisabled: isRequired,
                isDragDisabled,
                leftElement: (
                    <View style={[styles.mr3, isDragDisabled && styles.cursorDisabled]}>
                        <Icon
                            src={icons.DragHandles}
                            fill={theme.icon}
                            additionalStyles={isDragDisabled && styles.opacitySemiTransparent}
                        />
                    </View>
                ),
            };
        }),
    );

    const typeColumnsList = allColumnsList.filter((column) => allTypeCustomColumns.includes(column.keyForList));
    const groupColumnsList = allColumnsList.filter((column) => allGroupCustomColumns.includes(column.keyForList));

    const isDefaultState =
        columns.length === defaultColumns.length &&
        columns.every((col, index) => col.columnId === defaultColumns.at(index)?.columnId && col.isSelected === defaultColumns.at(index)?.isSelected);

    const onSelectItem = (item: ListItem) => {
        const updatedColumnId = item.keyForList as SearchCustomColumnIds;

        if (requiredColumns.has(updatedColumnId)) {
            return;
        }

        setColumns((prevColumns) => {
            const columnToUpdate = prevColumns.find((col) => col.columnId === updatedColumnId);

            if (!columnToUpdate) {
                return prevColumns;
            }

            const newIsSelected = !columnToUpdate.isSelected;

            if (newIsSelected) {
                const selected = prevColumns.filter((col) => col.isSelected);
                const unselected = prevColumns.filter((col) => !col.isSelected && col.columnId !== updatedColumnId);
                const unselectedSorted = unselected.sort((a, b) => {
                    const keyA = getSearchColumnTranslationKey(a.columnId);
                    const keyB = getSearchColumnTranslationKey(b.columnId);
                    const textA = keyA ? translate(keyA) : '';
                    const textB = keyB ? translate(keyB) : '';
                    return localeCompare(textA, textB);
                });
                return [...selected, {columnId: updatedColumnId, isSelected: true}, ...unselectedSorted];
            }

            const updatedColumns = prevColumns.map((col) => (col.columnId === updatedColumnId ? {...col, isSelected: false} : col));
            return updatedColumns;
        });
    };

    const onGroupDragEnd = ({data}: {data: typeof allColumnsList}) => {
        const newGroupColumns = data.map((item) => ({columnId: item.value, isSelected: item.isSelected}));
        const existingTypeColumns = typeColumnsList.map((item) => ({columnId: item.value, isSelected: item.isSelected}));
        const newColumns = [...existingTypeColumns, ...newGroupColumns];
        setColumns(newColumns);
    };

    const onTypeDragEnd = ({data}: {data: typeof allColumnsList}) => {
        const newTypeColumns = data.map((item) => ({columnId: item.value, isSelected: item.isSelected}));
        const existingGroupColumns = groupColumnsList.map((item) => ({columnId: item.value, isSelected: item.isSelected}));
        const newColumns = [...existingGroupColumns, ...newTypeColumns];
        setColumns(newColumns);
    };

    const resetColumns = () => {
        setColumns(defaultColumns);
    };

    const applyChanges = () => {
        const updatedAdvancedFilters: Partial<SearchAdvancedFiltersForm> = {
            ...searchAdvancedFiltersForm,
            columns: selectedColumnIds,
        };

        const queryString = buildQueryStringFromFilterFormValues(updatedAdvancedFilters);

        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
    };

    const renderItem = ({item}: {item: ListItem}) => {
        return (
            <MultiSelectListItem
                item={item}
                showTooltip={false}
                onSelectRow={onSelectItem}
                isDisabled={item.isDisabled}
            />
        );
    };

    return (
        <ScreenWrapper
            testID="SearchColumnsPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.columns')}>
                {!isDefaultState && <TextLink onPress={resetColumns}>{translate('search.resetColumns')}</TextLink>}
            </HeaderWithBackButton>
            <View style={styles.flex1}>
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={styles.flex1}
                >
                    {!!groupBy && (
                        <>
                            <View style={[styles.ph5, styles.pb3]}>
                                <Text style={styles.textLabelSupporting}>{translate('search.groupColumns')}</Text>
                            </View>

                            <DraggableList
                                disableScroll
                                data={groupColumnsList}
                                keyExtractor={(item) => item.value}
                                onDragEnd={onGroupDragEnd}
                                renderItem={renderItem}
                            />

                            <View style={styles.dividerLine} />

                            <View style={[styles.ph5, styles.pv3]}>
                                <Text style={styles.textLabelSupporting}>{translate('search.expenseColumns')}</Text>
                            </View>
                        </>
                    )}

                    <DraggableList
                        disableScroll
                        data={typeColumnsList}
                        keyExtractor={(item) => item.value}
                        onDragEnd={onTypeDragEnd}
                        renderItem={renderItem}
                    />
                </ScrollView>
            </View>
            <View style={[styles.ph5, styles.pb5]}>
                <Button
                    large
                    success
                    pressOnEnter
                    text={translate('common.save')}
                    onPress={applyChanges}
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchColumnsPage;
