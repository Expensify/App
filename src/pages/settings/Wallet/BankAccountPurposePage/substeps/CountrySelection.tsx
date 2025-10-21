import React, {useCallback} from 'react';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import {navigateToBankAccountRoute, updateReimbursementAccountDraft} from '@userActions/ReimbursementAccount';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function CountrySelection() {
    const onCountrySelected = useCallback((country: string) => {
        updateReimbursementAccountDraft({country: country as Country, currency: CONST.BBA_COUNTRY_CURRENCY_MAP[country]});
        navigateToBankAccountRoute(undefined, ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);
    }, []);

    return (
        <CountrySelectionList
            selectedCountry=""
            countries={CONST.BBA_SUPPORTED_COUNTRIES}
            onCountrySelected={onCountrySelected}
        />
    );
}

CountrySelection.displayName = 'CountrySelection';

export default CountrySelection;
