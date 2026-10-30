/** Renders the Wise-backed employee bank-account country picker and dynamic form flow. */
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DynamicFormFlow from '@components/DynamicForm';
import type {FormValue} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

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

function WiseDepositAccountContent({backTo}: WiseDepositAccountContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [wiseBankAccountFields] = useOnyx(ONYXKEYS.WISE_BANK_ACCOUNT_FIELDS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [country] = useOnyx(ONYXKEYS.COUNTRY);
    const [selectedCountry, setSelectedCountry] = useState(wiseBankAccountFields?.country ?? country ?? '');
    const [selectedPayoutType, setSelectedPayoutType] = useState<string>();
    const errorMessage = getLatestErrorMessage(wiseBankAccountFields);
    const payoutTypes = wiseBankAccountFields?.payoutTypes ?? [];
    const payoutType = payoutTypes.find((option) => option.type === selectedPayoutType) ?? (payoutTypes.length === 1 ? payoutTypes.at(0) : undefined);

    const leaveFlow = () => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        clearWiseBankAccountFields();
        setSelectedPayoutType(undefined);
        Navigation.goBack(backTo ?? ROUTES.SETTINGS_WALLET);
    };

    const leaveForm = () => {
        if (payoutTypes.length > 1) {
            setSelectedPayoutType(undefined);
            return;
        }
        clearWiseBankAccountFields();
    };

    const fetchForm = () => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        getWiseBankAccountFields(selectedCountry);
    };

    const refreshForm = (inputID: string, value: FormValue) => {
        const answers: Record<string, unknown> = {...draftValues, payoutType: payoutType?.type, [inputID]: value};
        const currency = typeof answers.currency === 'string' ? answers.currency : wiseBankAccountFields?.currency;
        getWiseBankAccountFields(selectedCountry, currency, answers);
    };

    const submitForm = () => leaveFlow();

    if (wiseBankAccountFields?.isLoading) {
        return (
            <FullScreenLoadingIndicator
                shouldUseGoBackButton
                onGoBack={leaveFlow}
            />
        );
    }

    if (payoutType) {
        return (
            <DynamicFormFlow
                schema={payoutType.schema}
                formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
                headerTitle={translate('bankAccount.addBankAccount')}
                confirmationTitle={translate('addPersonalBankAccount.confirmationStepHeader')}
                testID="WiseDepositAccountContent"
                buildRoute={(pageName, action) => ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backTo, pageName, action)}
                currency={wiseBankAccountFields.currency}
                onRefreshRequirements={refreshForm}
                onSubmit={submitForm}
                onBack={leaveForm}
            />
        );
    }

    if (payoutTypes.length > 1) {
        return (
            <ScreenWrapper
                shouldEnableMaxHeight
                testID="WiseDepositAccountContent"
            >
                <Header>
                    <Header.BackButton onPress={clearWiseBankAccountFields} />
                    <Header.Title title={translate('bankAccount.addBankAccount')} />
                </Header>
                <SelectionList
                    data={payoutTypes.map((option) => ({keyForList: option.type, text: option.title, isSelected: option.type === selectedPayoutType}))}
                    ListItem={SingleSelectListItem}
                    onSelectRow={(item) => setSelectedPayoutType(item.keyForList)}
                    shouldSingleExecuteRowSelect
                />
            </ScreenWrapper>
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
