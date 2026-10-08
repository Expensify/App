import {getLocalCurrencies} from '@libs/BankAccountFields';

import type CustomSubPageProps from '@pages/settings/Wallet/CollectDepositAccount/types';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';

import {setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/CollectDepositAccountForm';

import React, {useState} from 'react';

function CountrySelection({isEditing, onNext, onMove, formValues}: CustomSubPageProps) {
    const previousCountry = formValues[INPUT_IDS.BANK_COUNTRY] || '';
    const [selectedCountry, setSelectedCountry] = useState(previousCountry);

    const confirmCountry = () => {
        const hasCountryChanged = selectedCountry !== previousCountry;
        // Countries with a single currency have nothing to pick, so default it and let the details step move on.
        const [firstCurrency] = getLocalCurrencies(selectedCountry);

        // A different country asks for different details, so everything collected for the last one is dropped.
        const clearedFields = hasCountryChanged
            ? Object.fromEntries(
                  Object.keys(formValues)
                      .filter((fieldName) => fieldName !== INPUT_IDS.BANK_COUNTRY && fieldName !== INPUT_IDS.BANK_CURRENCY)
                      .map((fieldName) => [fieldName, '']),
              )
            : {};

        setDraftValues(ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM, {
            ...clearedFields,
            [INPUT_IDS.BANK_COUNTRY]: selectedCountry,
            [INPUT_IDS.BANK_CURRENCY]: hasCountryChanged ? firstCurrency || '' : formValues[INPUT_IDS.BANK_CURRENCY],
        });

        if (hasCountryChanged) {
            onMove(CONST.COLLECT_DEPOSIT_ACCOUNT.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS, false);
            return;
        }
        onNext();
    };

    const countries = Object.keys(CONST.ALL_COUNTRIES);

    return (
        <CountrySelectionList
            isEditing={isEditing}
            selectedCountry={selectedCountry}
            countries={countries}
            onCountrySelected={setSelectedCountry}
            onConfirm={confirmCountry}
        />
    );
}

CountrySelection.displayName = 'CountrySelection';

export default CountrySelection;
