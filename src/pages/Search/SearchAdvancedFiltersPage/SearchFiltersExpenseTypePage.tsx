import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getExpenseTypeTranslationKey} from '@libs/SearchUIUtils';
import {updateAdvancedFilters} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SearchFiltersExpenseTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const initiallySelectedItems = useMemo(
        () =>
            searchAdvancedFiltersForm?.expenseType
                ?.filter((expenseType) => Object.values(CONST.SEARCH.TRANSACTION_TYPE).includes(expenseType as ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>))
                .map((expenseType) => {
                    const expenseTypeName = translate(getExpenseTypeTranslationKey(expenseType as ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>));
                    return {name: expenseTypeName, value: expenseType};
                }),
        [searchAdvancedFiltersForm, translate],
    );
    const allExpenseTypes = Object.values(CONST.SEARCH.TRANSACTION_TYPE);

    const expenseTypesItems = useMemo(() => {
        return allExpenseTypes.map((expenseType) => {
            const expenseTypeName = translate(getExpenseTypeTranslationKey(expenseType));
            return {name: expenseTypeName, value: expenseType};
        });
    }, [allExpenseTypes, translate]);

    const updateExpenseTypeFilter = useCallback((values: string[]) => updateAdvancedFilters({expenseType: values}), []);

    return (
        <ScreenWrapper
            testID="SearchFiltersExpenseTypePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.expenseType')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    items={expenseTypesItems}
                    initiallySelectedItems={initiallySelectedItems}
                    onSaveSelection={updateExpenseTypeFilter}
                    shouldShowTextInput={false}
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchFiltersExpenseTypePage;
