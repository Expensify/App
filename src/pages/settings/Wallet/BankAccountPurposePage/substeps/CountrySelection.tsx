import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePressLoading from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';

import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';

import {navigateToBankAccountRoute, prepareStandaloneBankAccountSetup} from '@userActions/ReimbursementAccount';

import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useState} from 'react';

function CountrySelection() {
    const [country] = useOnyx(ONYXKEYS.COUNTRY);
    const personalPolicy = usePersonalPolicy();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    let initialCountry;
    const outputCurrency = personalPolicy?.outputCurrency;
    if (!outputCurrency) {
        initialCountry = '';
    } else if (CONST.BBA_EU_ORIGINAL_CURRENCY_COUNTRY_MAP[outputCurrency]) {
        initialCountry = CONST.BBA_EU_ORIGINAL_CURRENCY_COUNTRY_MAP[outputCurrency];
    } else {
        const countriesWithCurrency = Object.entries(CONST.BBA_COUNTRY_CURRENCY_MAP)
            .filter(([, currency]) => currency === outputCurrency)
            .map(([countryCode]) => countryCode);
        if (countriesWithCurrency.length === 1) {
            initialCountry = countriesWithCurrency.at(0) ?? '';
        } else if (countriesWithCurrency.length > 1) {
            if (country && countriesWithCurrency.includes(country)) {
                initialCountry = country;
            } else {
                initialCountry = '';
            }
        } else {
            const isSupportedCountry = !!country && !!CONST.BBA_COUNTRY_CURRENCY_MAP[country];
            initialCountry = isSupportedCountry ? country : '';
        }
    }

    const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
    const [shouldShowError, setShouldShowError] = useState(false);
    const {isLoading, startWithLoading} = usePressLoading();

    const onCountrySelected = (countryChecked: string) => {
        setShouldShowError(false);
        setSelectedCountry(countryChecked);
    };

    const onConfirm = () => {
        if (!selectedCountry) {
            setShouldShowError(true);
            return;
        }
        startWithLoading(() => {
            prepareStandaloneBankAccountSetup(CONST.BBA_COUNTRY_CURRENCY_MAP[selectedCountry], selectedCountry as Country);
            navigateToBankAccountRoute({backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE});
        });
    };

    return (
        <CountrySelectionList
            selectedCountry={selectedCountry}
            countries={CONST.BBA_SUPPORTED_COUNTRIES}
            onCountrySelected={onCountrySelected}
            onConfirm={onConfirm}
            footerContent={
                <FormAlertWithSubmitButton
                    buttonText={translate('common.next')}
                    shouldShowLoadingImmediatelyOnPress={false}
                    isLoading={isLoading}
                    onSubmit={onConfirm}
                    isAlertVisible={shouldShowError}
                    containerStyles={[!shouldShowError && styles.mt5]}
                    message={translate('workspace.companyCards.addNewCard.error.pleaseSelectCountry')}
                />
            }
        />
    );
}

CountrySelection.displayName = 'CountrySelection';

export default CountrySelection;
