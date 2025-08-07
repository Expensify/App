import React, {useCallback, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import type CustomSubStepProps from '@pages/settings/Wallet/InternationalDepositAccount/types';
import {fetchCorpayFields} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function CountrySelection({isEditing, onNext, formValues, resetScreenIndex}: CustomSubStepProps) {
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: (account) => account?.validated,
        canBeMissing: false,
    });

    const onCountrySelected = useCallback(
        (country: string) => {
            if (country === CONST.COUNTRY.US) {
                if (isUserValidated) {
                    Navigation.navigate(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT);
                } else {
                    Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute(), ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT));
                }
                return;
            }
            if (isEditing && formValues.bankCountry === country) {
                onNext();
                return;
            }
            fetchCorpayFields(country);
            resetScreenIndex?.(CONST.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS);
        },
        [formValues.bankCountry, isEditing, onNext, resetScreenIndex, isUserValidated],
    );

    const countries = useMemo(() => Object.keys(CONST.ALL_COUNTRIES).filter((countryISO) => !CONST.CORPAY_FIELDS.EXCLUDED_COUNTRIES.includes(countryISO)), []);

    return (
        <CountrySelectionList
            isEditing={isEditing}
            selectedCountry={formValues.bankCountry}
            countries={countries}
            onCountrySelected={onCountrySelected}
        />
    );
}

CountrySelection.displayName = 'CountrySelection';

export default CountrySelection;
