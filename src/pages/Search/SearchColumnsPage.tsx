import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem} from '@components/SelectionList/types';
import SelectionList from '@components/SelectionListWithSections';
import MultiSelectListItem from '@components/SelectionListWithSections/MultiSelectListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearAllFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

type ColumnId = ValueOf<typeof CONST.SEARCH.COLUMNS>;

const allColumns = Object.values(CONST.SEARCH.COLUMNS);

function SearchColumnsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    console.log(searchAdvancedFiltersForm);

    const [selectedColumnIds, setSelectedColumnIds] = useState<ColumnId[]>(() => {
        const columnIds = searchAdvancedFiltersForm?.columns?.filter((columnId) => Object.values(CONST.SEARCH.COLUMNS).includes(columnId as ColumnId)) ?? [];
        return columnIds as ColumnId[];
    });

    const sections = [
        {
            title: undefined,
            data: allColumns.map((columnId) => ({
                text: translate(getSearchColumnTranslationKey(columnId)),
                value: columnId,
                keyForList: columnId,
                isSelected: selectedColumnIds?.includes(columnId),
            })),
        },
    ];

    const onSelectItem = (item: ListItem) => {
        const updatedColumnId = item.keyForList as ColumnId;

        if (item.isSelected) {
            setSelectedColumnIds(selectedColumnIds.filter((columnId) => columnId !== updatedColumnId));
        } else {
            setSelectedColumnIds([...selectedColumnIds, updatedColumnId]);
        }
    };

    const applyChanges = () => {
        const updatedAdvancedFilters: Partial<SearchAdvancedFiltersForm> = {...searchAdvancedFiltersForm, columns: selectedColumnIds};
        const queryString = buildQueryStringFromFilterFormValues(updatedAdvancedFilters);
        clearAllFilters();
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
    };

    return (
        <ScreenWrapper
            testID={SearchColumnsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton title={translate('search.columms')} />
            <View style={[styles.flex1]}>
                <SelectionList
                    sections={sections}
                    onSelectRow={onSelectItem}
                    shouldStopPropagation
                    shouldShowTooltips
                    canSelectMultiple
                    ListItem={MultiSelectListItem}
                    footerContent={
                        <Button
                            large
                            success
                            pressOnEnter
                            style={[styles.mt3]}
                            text={translate('common.save')}
                            onPress={applyChanges}
                        />
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

SearchColumnsPage.displayName = 'SearchColumnsPage';

export default SearchColumnsPage;
