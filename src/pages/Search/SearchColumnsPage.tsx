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
import arraysEqual from '@src/utils/arraysEqual';

function SearchColumnsPage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DragHandles']);
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const queryType = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
    const allCustomColumns = getCustomColumns(queryType);
    const defaultCustomColumns = getCustomColumnDefault(queryType);

    type ColumnItem = {
        columnId: SearchCustomColumnIds;
        isSelected: boolean;
    };

    const [columns, setColumns] = useState<ColumnItem[]>(() => {
        const savedColumnIds = searchAdvancedFiltersForm?.columns?.filter((columnId) => allCustomColumns.includes(columnId)) ?? [];
        const selectedIds = savedColumnIds.length ? savedColumnIds : defaultCustomColumns;

        return allCustomColumns.map((columnId) => ({
            columnId,
            isSelected: selectedIds.includes(columnId),
        }));
    });

    const selectedColumnIds = columns.filter((col) => col.isSelected).map((col) => col.columnId);

    const columnsList = columns.map(({columnId, isSelected}) => ({
        text: translate(getSearchColumnTranslationKey(columnId)),
        value: columnId,
        keyForList: columnId,
        isSelected,
        leftElement: (
            <Icon
                src={icons.DragHandles}
                fill={theme.icon}
                additionalStyles={styles.mr3}
            />
        ),
    }));

    const sortedDefaultColumns = [...defaultCustomColumns].sort();
    const sortedSelectedColumnIds = [...selectedColumnIds].sort();
    const shouldShowResetColumns = !arraysEqual(sortedSelectedColumnIds, sortedDefaultColumns);

    const onSelectItem = (item: ListItem) => {
        const updatedColumnId = item.keyForList as SearchCustomColumnIds;

        setColumns(columns.map((col) => (col.columnId === updatedColumnId ? {...col, isSelected: !col.isSelected} : col)));
    };

    const onDragEnd = ({data}: {data: typeof columnsList}) => {
        setColumns(data.map((item) => ({columnId: item.value, isSelected: item.isSelected})));
    };

    const resetColumns = () => {
        setColumns(
            allCustomColumns.map((columnId) => ({
                columnId,
                isSelected: defaultCustomColumns.includes(columnId),
            })),
        );
    };

    const applyChanges = () => {
        if (!selectedColumnIds.length) {
            return;
        }

        const updatedAdvancedFilters: Partial<SearchAdvancedFiltersForm> = {...searchAdvancedFiltersForm, columns: selectedColumnIds};
        const queryString = buildQueryStringFromFilterFormValues(updatedAdvancedFilters);

        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
    };

    const renderItem = ({item}: {item: ListItem}) => {
        return (
            <MultiSelectListItem
                item={item} 
                showTooltip={false}
                onSelectRow={onSelectItem}
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
                {shouldShowResetColumns && <TextLink onPress={resetColumns}>{translate('search.resetColumns')}</TextLink>}
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
