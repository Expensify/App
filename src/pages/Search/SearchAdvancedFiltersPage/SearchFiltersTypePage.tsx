import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getTypeOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type Nullable from '@src/types/utils/Nullable';

function SearchFiltersTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [selectedItem, setSelectedItem] = useState(searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE);

    const listData: Array<ListItem<SearchDataTypes>> = useMemo(() => {
        return getTypeOptions(allPolicies, session?.email).map((typeOption) => ({
            text: translate(typeOption.translation),
            keyForList: typeOption.value,
            isSelected: selectedItem === typeOption.value,
        }));
    }, [allPolicies, selectedItem, session?.email, translate]);

    const updateSelectedItem = useCallback((type: ListItem<SearchDataTypes>) => {
        setSelectedItem(type?.keyForList ?? CONST.SEARCH.DATA_TYPES.EXPENSE);
    }, []);

    const resetChanges = useCallback(() => {
        setSelectedItem(CONST.SEARCH.DATA_TYPES.EXPENSE);
    }, []);

    const applyChanges = useCallback(() => {
        const hasTypeChanged = selectedItem !== searchAdvancedFiltersForm?.type;
        const updatedFilters: Partial<Nullable<SearchAdvancedFiltersForm>> = {
            type: selectedItem,
        };

        if (hasTypeChanged) {
            Object.keys(searchAdvancedFiltersForm ?? {})
                .filter((key) => key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE)
                .forEach((key) => {
                    if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS) {
                        updatedFilters[key] = CONST.SEARCH.STATUS.EXPENSE.ALL;
                        return;
                    }

                    updatedFilters[key as keyof SearchAdvancedFiltersForm] = null;
                });
        }

        updateAdvancedFilters(updatedFilters);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [searchAdvancedFiltersForm, selectedItem]);

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
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
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
