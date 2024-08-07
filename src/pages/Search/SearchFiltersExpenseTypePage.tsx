import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function getExpenseTypeTranslationKey(expenseType: ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>): TranslationPaths {
    // eslint-disable-next-line default-case
    switch (expenseType) {
        case 'distance':
            return 'common.distance';
        case 'card':
            return 'common.card';
        case 'cash':
            return 'iou.cash';
    }
}

function SearchFiltersExpenseTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const selectedExpenseTypes = searchAdvancedFiltersForm?.expenseType?.map((expenseType) => {
        const expenseTypeName = translate(getExpenseTypeTranslationKey(expenseType as ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>));
        return {name: expenseTypeName, value: expenseType};
    });
    const allExpenseTypes = Object.values(CONST.SEARCH.TRANSACTION_TYPE);

    const expenseTypesItems = useMemo(() => {
        return allExpenseTypes.map((expenseType) => {
            const expenseTypeName = translate(getExpenseTypeTranslationKey(expenseType));
            return {name: expenseTypeName, value: expenseType};
        });
    }, [allExpenseTypes, translate]);

    const onSaveSelection = useCallback((values: string[]) => SearchActions.updateAdvancedFilters({expenseType: values}), []);

    return (
        <ScreenWrapper
            testID={SearchFiltersExpenseTypePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('search.expenseTypes')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    pickerTitle={translate('search.expenseTypes')}
                    items={expenseTypesItems}
                    initiallySelectedItems={selectedExpenseTypes}
                    onSaveSelection={onSaveSelection}
                    shouldShowTextInput={false}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchFiltersExpenseTypePage.displayName = 'SearchFiltersCategoryPage';

export default SearchFiltersExpenseTypePage;
