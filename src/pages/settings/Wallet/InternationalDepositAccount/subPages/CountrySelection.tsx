import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import type CustomSubPageProps from '@pages/settings/Wallet/InternationalDepositAccount/types';

import {fetchCorpayFields} from '@userActions/BankAccounts';

import CONST, {COUNTRIES_US_BANK_FLOW} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {isUserValidatedSelector} from '@selectors/Account';
import React, {useState} from 'react';

function CountrySelection({isEditing, onNext, onMove, formValues, fieldsMap}: CustomSubPageProps) {
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [selectedCountry, setSelectedCountry] = useState(formValues.bankCountry || '');

    const defaultExpensePolicy = useDefaultExpensePolicy();
    const isDefaultWorkspacePayingWithABAFiles = !!defaultExpensePolicy?.reimbursement?.countries?.[CONST.COUNTRY.AU]?.additionalData?.isForABA;

    const onCountrySelected = () => {
        if (selectedCountry === CONST.COUNTRY.AU && isDefaultWorkspacePayingWithABAFiles) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_ABA_BANK_ACCOUNT);
            return;
        }
        if (COUNTRIES_US_BANK_FLOW.includes(selectedCountry)) {
            if (isUserValidated) {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_US_BANK_ACCOUNT_ENTRY_POINT.path, ROUTES.SETTINGS_WALLET));
            } else {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path));
            }
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
