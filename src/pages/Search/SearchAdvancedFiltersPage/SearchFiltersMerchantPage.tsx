import React from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SearchFiltersTextBase from '@components/Search/SearchFiltersTextBase';
import useLocalize from '@hooks/useLocalize';
import {isValidInputLength} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

function SearchFiltersMerchantPage() {
    const {translate} = useLocalize();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM> = {};
        const merchantValue = values.merchant.trim();
        const {isValid, byteLength} = isValidInputLength(merchantValue, CONST.MERCHANT_NAME_MAX_BYTES);

        if (!isValid) {
            errors.merchant = translate('common.error.characterLimitExceedCounter', {length: byteLength, limit: CONST.MERCHANT_NAME_MAX_BYTES});
        }

        return errors;
    };

    return (
        <SearchFiltersTextBase
            filterKey="merchant"
            titleKey="common.merchant"
            testID={SearchFiltersMerchantPage.displayName}
            validate={validate}
        />
    );
}

SearchFiltersMerchantPage.displayName = 'SearchFiltersMerchantPage';

export default SearchFiltersMerchantPage;
