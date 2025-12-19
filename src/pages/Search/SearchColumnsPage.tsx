import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DraggableList from '@components/DraggableList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SearchCustomColumnIds} from '@components/Search/types';
import type {ListItem} from '@components/SelectionList/types';
import MultiSelectListItem from '@components/SelectionListWithSections/MultiSelectListItem';
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
    columnId: SearchCustomColumnIds;
    isSelected: boolean;
};

function SearchColumnsPage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DragHandles']);
    const {translate, localeCompare} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const queryType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
    const allCustomColumns = getCustomColumns(queryType);
    const defaultCustomColumns = getCustomColumnDefault(queryType);

    // We need at least one element with flex1 in the table to ensure the table looks good in the UI, so we don't allow removing the total columns since it makes sense for them to show up in an expense management App and it fixes the layout issues.
    const requiredColumns = new Set<SearchCustomColumnIds>([CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, CONST.SEARCH.TABLE_COLUMNS.TOTAL]);

    const sortColumns = (columnsToSort: ColumnItem[]): ColumnItem[] => {
        const selected = columnsToSort.filter((col) => col.isSelected);
        const unselected = columnsToSort
            .filter((col) => !col.isSelected)
            .sort((a, b) => {
                const textA = translate(getSearchColumnTranslationKey(a.columnId));
                const textB = translate(getSearchColumnTranslationKey(b.columnId));
                return localeCompare(textA, textB);
            });
        return [...selected, ...unselected];
    };

    const [columns, setColumns] = useState<ColumnItem[]>(() => {
        const savedColumnIds = searchAdvancedFiltersForm?.columns?.filter((columnId) => allCustomColumns.includes(columnId)) ?? [];

        if (!savedColumnIds.length) {
            const initialColumns = allCustomColumns.map((columnId) => ({
                columnId,
                isSelected: defaultCustomColumns.includes(columnId),
            }));
            return sortColumns(initialColumns);
        }

        const selected = savedColumnIds.map((columnId) => ({columnId, isSelected: true}));
        const unselected = allCustomColumns.filter((columnId) => !savedColumnIds.includes(columnId)).map((columnId) => ({columnId, isSelected: false}));

        return sortColumns([...selected, ...unselected]);
    });

    const selectedColumnIds = columns.filter((col) => col.isSelected).map((col) => col.columnId);

    const columnsList = columns.map(({columnId, isSelected}) => {
        const isRequired = requiredColumns.has(columnId);
        const isEffectivelySelected = isRequired || isSelected;
        const isDragDisabled = !isEffectivelySelected;
        return {
            text: translate(getSearchColumnTranslationKey(columnId)),
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
    });

    const defaultColumns = sortColumns(
        allCustomColumns.map((columnId) => ({
            columnId,
            isSelected: defaultCustomColumns.includes(columnId),
        })),
    );

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
                    const textA = translate(getSearchColumnTranslationKey(a.columnId));
                    const textB = translate(getSearchColumnTranslationKey(b.columnId));
                    return localeCompare(textA, textB);
                });
                return [...selected, {columnId: updatedColumnId, isSelected: true}, ...unselectedSorted];
            }

            const updatedColumns = prevColumns.map((col) => (col.columnId === updatedColumnId ? {...col, isSelected: false} : col));
            return sortColumns(updatedColumns);
        });
    };

    const onDragEnd = ({data}: {data: typeof columnsList}) => {
        const newColumns = data.map((item) => ({columnId: item.value, isSelected: item.isSelected}));
        setColumns(sortColumns(newColumns));
    };

    const resetColumns = () => setColumns(defaultColumns);

    const applyChanges = () => {
        if (!selectedColumnIds.length) {
            return;
        }

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
                <DraggableList
                    data={columnsList}
                    keyExtractor={(item) => item.value}
                    onDragEnd={onDragEnd}
                    renderItem={renderItem}
                />
            </View>
            <View style={[styles.ph5, styles.pb5]}>
                {!selectedColumnIds.length && (
                    <DotIndicatorMessage
                        type="error"
                        style={styles.mb3}
                        messages={{error: translate('search.noColumnsError')}}
                    />
                )}
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
