/** Lets an employee pick the country of their bank account, then fills in the bank account form Wise defines for it. */
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DynamicFormFlow from '@components/DynamicForm';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {FormValue} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';

import {clearWiseBankAccountFields, createWiseBankAccount, getWiseBankAccountFields} from '@userActions/BankAccounts';
import {clearDraftValues, clearErrors, setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

import React, {useEffect, useEffectEvent, useState} from 'react';

import getCurrentSchemaAnswers from './getCurrentSchemaAnswers';

type WiseDepositAccountContentProps = {
    backTo?: Route;

    /** The form page the URL points at, if any */
    subPage?: string;
};

const COUNTRIES = Object.keys(CONST.ALL_COUNTRIES).filter((countryISO) => !CONST.WISE.EXCLUDED_BANK_ACCOUNT_COUNTRIES.includes(countryISO));

/**
 * The fields key is RAM-only, so a reload or a deep link opens a form page with no schema, and the screen shows the country list instead.
 * The URL is replaced with the base route to match it. This only runs when the screen opens: leaving the flow also clears the schema while the
 * screen is still closing, and replacing the URL then would open the flow again.
 */
function useReturnToCountryListOnOpenWithoutSchema(isOnPageWithoutSchema: boolean, backTo: Route | undefined) {
    const returnToCountryList = useEffectEvent(() => {
        if (!isOnPageWithoutSchema) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backTo), {forceReplace: true});
    });
    useEffect(() => {
        returnToCountryList();
    }, []);
}

function WiseDepositAccountContent({backTo, subPage}: WiseDepositAccountContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [wiseBankAccountFields] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [formState] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
    const [country] = useOnyx(ONYXKEYS.COUNTRY);
    const storedCountry = wiseBankAccountFields?.country ?? country ?? '';
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.includes(storedCountry) ? storedCountry : '');
    const errorMessage = getLatestErrorMessage(wiseBankAccountFields);
    const payoutType = wiseBankAccountFields?.payoutType;
    const formCurrency = wiseBankAccountFields?.currency;
    const schema = wiseBankAccountFields?.schema;

    // The currency and payout type selects start on what the server picked. A value the server just sent replaces the user's pick, while a screen
    // that opens on a later page only fills what the draft is missing, so a pick kept after a failed refresh survives the next page.
    const hasSchema = !!schema;
    const previousPayoutType = usePrevious(payoutType);
    const previousFormCurrency = usePrevious(formCurrency);
    const shouldSeed = (serverValue: string | undefined, previousServerValue: string | undefined, draftValue: unknown): serverValue is string =>
        !!serverValue && draftValue !== serverValue && (serverValue !== previousServerValue || !draftValue);
    const seedServerChoices = useEffectEvent(() => {
        const seed: Record<string, string> = {};
        if (shouldSeed(payoutType, previousPayoutType, draftValues?.payoutType)) {
            seed.payoutType = payoutType;
        }
        if (shouldSeed(formCurrency, previousFormCurrency, draftValues?.currency)) {
            seed.currency = formCurrency;
        }
        if (Object.keys(seed).length === 0) {
            return;
        }
        setDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM, seed);
    });
    useEffect(() => {
        if (!hasSchema) {
            return;
        }
        seedServerChoices();
    }, [hasSchema, payoutType, formCurrency]);

    useReturnToCountryListOnOpenWithoutSchema(!!subPage && !schema && !wiseBankAccountFields?.isLoading, backTo);

    // The form key is persisted, so a failed submit's error is cleared when the flow opens and when it closes. Otherwise it shows on the
    // confirmation page the next time the user opens the flow, before they press Confirm
    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        return () => {
            clearErrors(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        };
    }, []);

    // Back from the first form page shows the country list again, so the URL drops the form page to match it
    const returnToCountryList = () => {
        clearWiseBankAccountFields();
        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backTo), {forceReplace: true});
    };

    const leaveFlow = () => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        clearWiseBankAccountFields();
        Navigation.goBack(backTo ?? ROUTES.SETTINGS_WALLET);
    };

    const fetchForm = () => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        getWiseBankAccountFields(selectedCountry);
    };

    // A refresh that failed leaves the server's currency behind the user's pick, so the user's answer wins over what the server last sent. An empty answer means no pick yet
    const getAnswerCurrency = (answers: Record<string, unknown>) => (typeof answers.currency === 'string' && answers.currency !== '' ? answers.currency : wiseBankAccountFields?.currency);

    const refreshForm = (inputID: string, value: FormValue) => {
        const answers = getCurrentSchemaAnswers(schema, draftValues);
        answers[inputID] = value;
        getWiseBankAccountFields(selectedCountry, getAnswerCurrency(answers), answers);
    };

    const submitForm = (answers: DynamicFormValues) => {
        createWiseBankAccount(selectedCountry, getAnswerCurrency(answers), answers);
    };

    if (wiseBankAccountFields?.isLoading) {
        return (
            <FullScreenLoadingIndicator
                shouldUseGoBackButton
                onGoBack={leaveFlow}
            />
        );
    }

    if (schema) {
        return (
            <DynamicFormFlow
                schema={schema}
                formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
                headerTitle={translate('bankAccount.addBankAccount')}
                confirmationTitle={translate('addPersonalBankAccount.confirmationStepHeader')}
                testID="WiseDepositAccountContent"
                buildRoute={(pageName, action) => ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backTo, pageName, action)}
                currency={wiseBankAccountFields.currency}
                onRefreshRequirements={refreshForm}
                onSubmit={submitForm}
                isSubmitting={!!formState?.isLoading}
                submitError={getLatestErrorMessage(formState)}
                onBack={returnToCountryList}
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
