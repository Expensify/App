import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersBillablePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const updateBillableFilter = useCallback((value: string[]) => {
        SearchActions.updateAdvancedFilters({billable: value});
        Navigation.goBack();
    }, []);

    const options = CONST.BILLABLE_OPTIONS.map((option) => ({
        name: option,
        value: option,
    }));

    const selectedItems = useMemo(() => {
        return options.filter((option) => searchAdvancedFiltersForm?.billable?.includes(option.value));
    }, [searchAdvancedFiltersForm, options]);

    return (
        <ScreenWrapper
            testID={SearchFiltersBillablePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.expenseType')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    disableSort
                    items={options}
                    initiallySelectedItems={selectedItems}
                    onSaveSelection={updateBillableFilter}
                    shouldShowTextInput={false}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersBillablePage.displayName = 'SearchFiltersBillablePage';

export default SearchFiltersBillablePage;
