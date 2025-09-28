import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionListWithSections';
import SingleSelectListItem from '@components/SelectionListWithSections/SingleSelectListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getTypeOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

function SearchFiltersTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [selectedItem, setSelectedItem] = useState(searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE);

    const listData: Array<ListItem<SearchDataTypes>> = useMemo(() => {
        return getTypeOptions(allPolicies, session?.email).map((typeOption) => ({
            text: typeOption.text,
            keyForList: typeOption.value,
            isSelected: selectedItem === typeOption.value,
        }));
    }, [allPolicies, selectedItem, session?.email]);

    const updateSelectedItem = useCallback((type: ListItem<SearchDataTypes>) => {
        setSelectedItem(type?.keyForList ?? CONST.SEARCH.DATA_TYPES.EXPENSE);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(CONST.SEARCH.DATA_TYPES.EXPENSE);
    }, []);

    const applyChanges = useCallback(() => {
        const hasTypeChanged = selectedItem !== searchAdvancedFiltersForm?.type;
        const updatedFilters = {
            type: selectedItem,
            ...(hasTypeChanged && {
                groupBy: null,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            }),
        };
        updateAdvancedFilters(updatedFilters);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [searchAdvancedFiltersForm?.type, selectedItem]);

    return (
        <ScreenWrapper
            testID={SearchFiltersTypePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.type')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    sections={[{data: listData}]}
                    ListItem={SingleSelectListItem}
                    onSelectRow={updateSelectedItem}
                />
            </View>
            <FixedFooter style={styles.mtAuto}>
                <SearchFilterPageFooterButtons
                    resetChanges={resetChanges}
                    applyChanges={applyChanges}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

SearchFiltersTypePage.displayName = 'SearchFiltersTypePage';

export default SearchFiltersTypePage;
