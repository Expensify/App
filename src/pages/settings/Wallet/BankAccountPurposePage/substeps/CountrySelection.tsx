import React, {useCallback} from 'react';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function CountrySelection() {
    const onCountrySelected = useCallback(() => {
        navigateToBankAccountRoute(CONST.DEFAULT_NUMBER_ID.toString(), ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);
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
