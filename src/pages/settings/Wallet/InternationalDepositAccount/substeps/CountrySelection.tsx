import {isUserValidatedSelector} from '@selectors/Account';
import React, {useCallback, useMemo, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import type CustomSubStepProps from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {fetchCorpayFields} from '@userActions/BankAccounts';
import CONST, {COUNTRIES_US_BANK_FLOW} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function CountrySelection({isEditing, onNext, formValues, resetScreenIndex, fieldsMap}: CustomSubStepProps) {
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: false});
    const [selectedCountry, setSelectedCountry] = useState(formValues.bankCountry || '');

    const onCountrySelected = useCallback(() => {
        if (COUNTRIES_US_BANK_FLOW.includes(selectedCountry)) {
            if (isUserValidated) {
                Navigation.navigate(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT);
            } else {
                Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT_SELECT_COUNTRY_VERIFY_ACCOUNT);
            }
            return;
        }
        if (!isEmptyObject(fieldsMap) && formValues.bankCountry === selectedCountry) {
            onNext();
            return;
        }
        fetchCorpayFields(selectedCountry);
        resetScreenIndex?.(CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS);
    }, [fieldsMap, formValues.bankCountry, resetScreenIndex, isUserValidated, onNext, selectedCountry]);

    const countries = useMemo(() => Object.keys(CONST.ALL_COUNTRIES).filter((countryISO) => !CONST.CORPAY_FIELDS.EXCLUDED_COUNTRIES.includes(countryISO)), []);

    return (
        <CountrySelectionList
            isEditing={isEditing}
            selectedCountry={selectedCountry}
            countries={countries}
            onCountrySelected={setSelectedCountry}
            onConfirm={onCountrySelected}
        />
    );
}

CountrySelection.displayName = 'CountrySelection';

export default CountrySelection;
