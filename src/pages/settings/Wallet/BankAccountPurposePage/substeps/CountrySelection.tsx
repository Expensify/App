import React from 'react';
import useOnyx from '@hooks/useOnyx';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import {clearReimbursementAccountDraft, navigateToBankAccountRoute, updateReimbursementAccountDraft} from '@userActions/ReimbursementAccount';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function CountrySelection() {
    const [country] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: true});

    const onCountrySelected = (selectedCountry: string) => {
        clearReimbursementAccountDraft();
        updateReimbursementAccountDraft({country: selectedCountry as Country, currency: CONST.BBA_COUNTRY_CURRENCY_MAP[selectedCountry]});
        navigateToBankAccountRoute(undefined, ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);
    };

    const isSupportedCountry = !!country && !!CONST.BBA_COUNTRY_CURRENCY_MAP[country];

    return (
        <CountrySelectionList
            selectedCountry={isSupportedCountry ? country : ''}
            countries={CONST.BBA_SUPPORTED_COUNTRIES}
            onCountrySelected={onCountrySelected}
        />
    );
}

CountrySelection.displayName = 'CountrySelection';

export default CountrySelection;
