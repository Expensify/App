import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getReceiptTypeTranslationKey} from '@libs/TransactionUtils';
import {updateAdvancedFilters} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReceiptTypeValues} from '@src/types/form/SearchAdvancedFiltersForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function SearchFiltersReceiptTypePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormResult] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const initiallySelectedItems = searchAdvancedFiltersForm?.receiptType
        ?.filter((receiptType) => Object.values(CONST.SEARCH.RECEIPT_TYPE).includes(receiptType as ValueOf<typeof CONST.SEARCH.RECEIPT_TYPE>))
        .map((receiptType) => {
            const receiptTypeName = translate(getReceiptTypeTranslationKey(receiptType as ValueOf<typeof CONST.SEARCH.RECEIPT_TYPE>));
            return {name: receiptTypeName, value: receiptType};
        });
    const allReceiptTypes = Object.values(CONST.SEARCH.RECEIPT_TYPE);

    const receiptTypesItems = allReceiptTypes.map((receiptType) => {
        const receiptTypeName = translate(getReceiptTypeTranslationKey(receiptType));
        return {name: receiptTypeName, value: receiptType};
    });

    const updateReceiptTypeFilter = (values: ReceiptTypeValues) => {
        // Drop any of the selected values from the negated filter so a positive selection can't leave a conflicting -receiptType in the query
        const remainingNegatedReceiptTypes = searchAdvancedFiltersForm?.receiptTypeNot?.filter((receiptType) => !values.includes(receiptType));
        updateAdvancedFilters({receiptType: values, receiptTypeNot: remainingNegatedReceiptTypes?.length ? remainingNegatedReceiptTypes : null});
    };

    return (
        <ScreenWrapper
            testID="SearchFiltersReceiptTypePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.receiptType')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                {!isLoadingOnyxValue(searchAdvancedFiltersFormResult) && (
                    <SearchMultipleSelectionPicker
                        items={receiptTypesItems}
                        initiallySelectedItems={initiallySelectedItems}
                        onSaveSelection={updateReceiptTypeFilter}
                        shouldShowTextInput={false}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

export default SearchFiltersReceiptTypePage;
