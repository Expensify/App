import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePressLoading from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';

import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';

import {clearInternationalBankAccount, clearPersonalBankAccount} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';
import {clearReimbursementAccount, clearReimbursementAccountDraft, navigateToBankAccountRoute, updateReimbursementAccountDraft} from '@userActions/ReimbursementAccount';

import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useMemo, useState} from 'react';

function CountrySelection() {
    const [country, countryMetadata] = useOnyx(ONYXKEYS.COUNTRY);
    const [reimbursementAccount, reimbursementAccountMetadata] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft, reimbursementAccountDraftMetadata] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const personalPolicy = usePersonalPolicy();
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const initialCountry = useMemo(() => {
        const draftCountry = reimbursementAccountDraft?.country;
        const isCompatibleDraftCountry =
            !!draftCountry && CONST.BBA_SUPPORTED_COUNTRIES.includes(draftCountry) && reimbursementAccountDraft?.currency === CONST.BBA_COUNTRY_CURRENCY_MAP[draftCountry];

        if (isCompatibleDraftCountry) {
            return draftCountry;
        }

        const outputCurrency = personalPolicy?.outputCurrency;

        if (!outputCurrency) {
            return '';
        }

        if (CONST.BBA_EU_ORIGINAL_CURRENCY_COUNTRY_MAP[outputCurrency]) {
            return CONST.BBA_EU_ORIGINAL_CURRENCY_COUNTRY_MAP[outputCurrency];
        }

        const countriesWithCurrency = Object.entries(CONST.BBA_COUNTRY_CURRENCY_MAP)
            .filter(([, currency]) => currency === outputCurrency)
            .map(([countryCode]) => countryCode);

        if (countriesWithCurrency.length === 1) {
            return countriesWithCurrency.at(0) ?? '';
        }

        if (countriesWithCurrency.length > 1) {
            if (country && countriesWithCurrency.includes(country)) {
                return country;
            }
            return '';
        }

        const isSupportedCountry = !!country && !!CONST.BBA_COUNTRY_CURRENCY_MAP[country];

        return isSupportedCountry ? country : '';
    }, [reimbursementAccountDraft?.country, reimbursementAccountDraft?.currency, personalPolicy?.outputCurrency, country]);

    const [selectedCountry, setSelectedCountry] = useState<string>();
    const [shouldShowError, setShouldShowError] = useState(false);
    const {isLoading, startWithLoading} = usePressLoading();
    const resolvedSelectedCountry = selectedCountry ?? initialCountry;

    const onCountrySelected = (countryChecked: string) => {
        setShouldShowError(false);
        setSelectedCountry(countryChecked);
    };

    const onConfirm = () => {
        if (!resolvedSelectedCountry) {
            setShouldShowError(true);
            return;
        }
        startWithLoading(() => {
            const selectedCurrency = CONST.BBA_COUNTRY_CURRENCY_MAP[resolvedSelectedCountry];
            const shouldResume = reimbursementAccountDraft?.country === resolvedSelectedCountry && reimbursementAccountDraft?.currency === selectedCurrency;

            clearPersonalBankAccount();
            clearInternationalBankAccount();
            clearDraftValues(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
            if (!shouldResume) {
                clearReimbursementAccount();
                clearReimbursementAccountDraft();
                updateReimbursementAccountDraft({country: resolvedSelectedCountry as Country, currency: selectedCurrency});
            }

            const policyID = shouldResume ? reimbursementAccount?.achData?.policyID : undefined;
            const bankAccountID = shouldResume ? reimbursementAccount?.achData?.bankAccountID : undefined;
            navigateToBankAccountRoute({
                ...(policyID ? {policyID} : {}),
                ...(bankAccountID ? {bankAccountID} : {}),
                backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE,
            });
        });
    };

    if (isLoadingOnyxValue(countryMetadata, reimbursementAccountMetadata, reimbursementAccountDraftMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <CountrySelectionList
            selectedCountry={resolvedSelectedCountry}
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
