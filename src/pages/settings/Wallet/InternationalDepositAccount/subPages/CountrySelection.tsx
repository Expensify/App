import useOnyx from '@hooks/useOnyx';

import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import navigateToUSBankAccountFlow from '@pages/settings/Wallet/InternationalDepositAccount/navigateToUSBankAccountFlow';
import type CustomSubPageProps from '@pages/settings/Wallet/InternationalDepositAccount/types';

import {fetchCorpayFields} from '@userActions/BankAccounts';

import CONST, {COUNTRIES_US_BANK_FLOW} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {isUserValidatedSelector} from '@selectors/Account';
import React, {useState} from 'react';

function CountrySelection({isEditing, onNext, onMove, formValues, fieldsMap}: CustomSubPageProps) {
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [selectedCountry, setSelectedCountry] = useState(formValues.bankCountry || '');

    const onCountrySelected = () => {
        if (COUNTRIES_US_BANK_FLOW.includes(selectedCountry)) {
            navigateToUSBankAccountFlow(isUserValidated);
            return;
        }
        if (!isEmptyObject(fieldsMap) && formValues.bankCountry === selectedCountry) {
            onNext();
            return;
        }
        fetchCorpayFields(selectedCountry);
        onMove(CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS, false);
    };

    const countries = Object.keys(CONST.ALL_COUNTRIES).filter((countryISO) => !CONST.CORPAY_FIELDS.EXCLUDED_COUNTRIES.includes(countryISO));

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
