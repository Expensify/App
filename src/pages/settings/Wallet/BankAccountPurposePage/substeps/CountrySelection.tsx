import React, {useState} from 'react';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import {clearReimbursementAccountDraft, navigateToBankAccountRoute, updateReimbursementAccountDraft} from '@userActions/ReimbursementAccount';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function CountrySelection() {
    const [country] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: true});
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const isSupportedCountry = !!country && !!CONST.BBA_COUNTRY_CURRENCY_MAP[country];

    const [selectedCountry, setSelectedCountry] = useState<string>(isSupportedCountry ? country : '');
    const [shouldShowError, setShouldShowError] = useState(false);

    const onCountrySelected = (countryChecked: string) => {
        setShouldShowError(false);
        setSelectedCountry(countryChecked);
    };

    const onConfirm = () => {
        if (!selectedCountry) {
            setShouldShowError(true);
            return;
        }
        clearReimbursementAccountDraft();
        updateReimbursementAccountDraft({country: selectedCountry as Country, currency: CONST.BBA_COUNTRY_CURRENCY_MAP[selectedCountry]});
        navigateToBankAccountRoute(undefined, ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);
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
