import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DynamicFormFlow from '@components/DynamicForm';
import type {FormValue} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';

import {clearWiseBankAccountFields, getWiseBankAccountFields} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

import React, {useState} from 'react';

type WiseDepositAccountContentProps = {
    backTo?: Route;
};

const COUNTRIES = Object.keys(CONST.ALL_COUNTRIES).filter((countryISO) => !CONST.CORPAY_FIELDS.EXCLUDED_COUNTRIES.includes(countryISO));

/** The employee bank-account flow on Wise: a country pick, then the form Wise's requirements describe */
function WiseDepositAccountContent({backTo}: WiseDepositAccountContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [wiseBankAccountFields] = useOnyx(ONYXKEYS.WISE_BANK_ACCOUNT_FIELDS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [country] = useOnyx(ONYXKEYS.COUNTRY);
    const [selectedCountry, setSelectedCountry] = useState(wiseBankAccountFields?.country ?? country ?? '');
    const errorMessage = getLatestErrorMessage(wiseBankAccountFields);

    const leaveFlow = () => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        clearWiseBankAccountFields();
        Navigation.goBack(backTo ?? ROUTES.SETTINGS_WALLET);
    };

    const fetchForm = () => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        getWiseBankAccountFields(selectedCountry);
    };

    const refreshForm = (inputID: string, value: FormValue) => {
        const answers: Record<string, unknown> = {...draftValues, [inputID]: value};
        const currency = typeof answers.currency === 'string' ? answers.currency : wiseBankAccountFields?.currency;
        getWiseBankAccountFields(selectedCountry, currency, answers);
    };

    const submitForm = () => leaveFlow();

    if (wiseBankAccountFields?.isLoading) {
        return <FullScreenLoadingIndicator onGoBack={leaveFlow} />;
    }

    if (wiseBankAccountFields?.schema) {
        return (
            <DynamicFormFlow
                schema={wiseBankAccountFields.schema}
                formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
                headerTitle={translate('bankAccount.addBankAccount')}
                confirmationTitle={translate('addPersonalBankAccount.confirmationStepHeader')}
                testID="WiseDepositAccountContent"
                buildRoute={(pageName, action) => ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backTo, pageName, action)}
                currency={wiseBankAccountFields.currency}
                onRefreshRequirements={refreshForm}
                onSubmit={submitForm}
                onBack={clearWiseBankAccountFields}
            />
        );
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="WiseDepositAccountContent"
        >
            <Header>
                <Header.BackButton onPress={leaveFlow} />
                <Header.Title title={translate('bankAccount.addBankAccount')} />
            </Header>
            {!!errorMessage && (
                <DotIndicatorMessage
                    style={[styles.mh5, styles.mb3]}
                    type="error"
                    messages={{error: errorMessage}}
                />
            )}
            <CountrySelectionList
                selectedCountry={selectedCountry}
                countries={COUNTRIES}
                onCountrySelected={setSelectedCountry}
                onConfirm={fetchForm}
            />
        </ScreenWrapper>
    );
}

export default WiseDepositAccountContent;
