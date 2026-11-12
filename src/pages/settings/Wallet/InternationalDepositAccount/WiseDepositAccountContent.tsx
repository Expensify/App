/** Lets an employee pick the country of their bank account, then fills in the bank account form Wise defines for it. */
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import DynamicFormFlow from '@components/DynamicForm';
import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {FormValue} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import ScreenWrapper from '@components/ScreenWrapper';
import TermsOfServiceLabel from '@components/TermsOfServiceLabel';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';

import {
    clearPersonalBankAccount,
    clearWiseBankAccountFields,
    clearWiseBankAccountFieldsKeepingCountry,
    clearWiseBankAccountForm,
    createWiseBankAccount,
    getWiseBankAccountFields,
} from '@userActions/BankAccounts';
import {clearSensitiveAnswers} from '@userActions/DynamicForm';
import {clearDraftValues, clearErrors, setDraftValues} from '@userActions/FormActions';
import {continueSetup} from '@userActions/PaymentMethods';

import CONST, {COUNTRIES_US_BANK_FLOW} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {PersonalBankAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isUserValidatedSelector} from '@selectors/Account';
import React, {useContext, useEffect, useEffectEvent, useState} from 'react';

import getCurrentSchemaAnswers from './getCurrentSchemaAnswers';
import navigateToUSBankAccountFlow from './navigateToUSBankAccountFlow';
import WiseBankAccountAdded from './WiseBankAccountAdded';

type WiseDepositAccountContentProps = {
    backTo?: Route;

    /** The form page the URL points at, if any */
    subPage?: string;

    /** The page was opened from the confirmation page to change an answer */
    isEditing?: boolean;
};

const onSuccessFallbackRouteSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.onSuccessFallbackRoute;

/** The schema's currency field, which also picks the kind of account Wise asks for */
const CURRENCY_INPUT_ID = 'currency';

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

function WiseDepositAccountContent({backTo, subPage, isEditing}: WiseDepositAccountContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [wiseBankAccountFields] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [formState] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
    const [country] = useOnyx(ONYXKEYS.COUNTRY);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [onSuccessFallbackRoute] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: onSuccessFallbackRouteSelector});
    const kycWallRef = useContext(KYCWallContext);
    const storedCountry = wiseBankAccountFields?.country ?? country ?? '';
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.includes(storedCountry) ? storedCountry : '');
    // The terms tick is kept on this screen only, not in the draft, so a new visit to the flow asks for it again
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [shouldShowTermsError, setShouldShowTermsError] = useState(false);
    // Remounts the form when it starts over, since its pages keep what the user typed in their own state as well as in the draft
    const [formStartCount, setFormStartCount] = useState(0);
    // Read once when the screen opens: a success that arrives later belongs to this visit and shows the success screen
    const [hasSuccessFromEarlierVisit, setHasSuccessFromEarlierVisit] = useState(() => !!formState?.isSuccess);
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
        clearWiseBankAccountFieldsKeepingCountry(selectedCountry);
        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backTo), {forceReplace: true});
    };

    // The purpose page only asks what the account is for, so like the Corpay flow, the user lands on the wallet instead of answering it again
    const exitRoute = backTo && !backTo.includes(ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE) ? backTo : ROUTES.SETTINGS_WALLET;

    const clearFlow = () => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        // The form drops these itself only when it sees the submit end, and a success replaces the form before that
        clearSensitiveAnswers(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        clearWiseBankAccountForm();
        clearWiseBankAccountFields();
    };

    // A success is cleared by Continue, so closing the success screen another way (a swipe, Escape) leaves it, with the created account's
    // answers, for the next visit. That visit starts over instead of opening on the success screen.
    const clearSuccessFromEarlierVisit = useEffectEvent(() => {
        if (!hasSuccessFromEarlierVisit) {
            return;
        }
        clearFlow();
    });
    useEffect(() => {
        clearSuccessFromEarlierVisit();
    }, []);

    // Escape and a swipe close the success screen without Continue, so what does not depend on where the user goes next runs as soon as the account exists
    const hasSuccessThisVisit = !!formState?.isSuccess && !hasSuccessFromEarlierVisit;
    useEffect(() => {
        if (!hasSuccessThisVisit) {
            return undefined;
        }
        // Only Continue resumes a payment that asked for a bank account, so closing the screen another way drops where it would go on
        return () => clearPersonalBankAccount();
    }, [hasSuccessThisVisit]);

    const leaveFlow = () => {
        clearFlow();
        Navigation.goBack(exitRoute);
    };

    const finishFlow = () => {
        clearFlow();
        // A payment that asked for a bank account saved where to go on, so it resumes now that the account exists
        if (onSuccessFallbackRoute) {
            continueSetup(kycWallRef, onSuccessFallbackRoute);
        } else {
            Navigation.goBack(exitRoute);
        }
        clearPersonalBankAccount();
    };

    const confirmCountry = () => {
        if (COUNTRIES_US_BANK_FLOW.includes(selectedCountry)) {
            navigateToUSBankAccountFlow(isUserValidated);
            return;
        }
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        // A success from an earlier visit is kept on the device, so it is dropped before the new form arrives
        clearWiseBankAccountForm();
        setHasSuccessFromEarlierVisit(false);
        getWiseBankAccountFields(selectedCountry);
    };

    // A refresh that failed leaves the server's currency behind the user's pick, so the user's answer wins over what the server last sent. An empty answer means no pick yet
    const getAnswerCurrency = (answers: Record<string, unknown>) => (typeof answers.currency === 'string' && answers.currency !== '' ? answers.currency : wiseBankAccountFields?.currency);

    /**
     * Another currency can mean another account, so every answer, the holder's included, is dropped rather than carried over to the new form, as in the Corpay flow.
     * A page opened from the confirmation page leaves edit mode, since confirming there again would show a form with every answer gone.
     */
    const startOverWithCurrency = (currency: string) => {
        clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        clearSensitiveAnswers(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
        setDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM, {[CURRENCY_INPUT_ID]: currency});
        setFormStartCount((count) => count + 1);
        getWiseBankAccountFields(selectedCountry, currency);
        if (isEditing && subPage) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backTo, subPage), {forceReplace: true});
        }
    };

    const refreshForm = (inputID: string, value: FormValue) => {
        // The draft this render read still holds the currency from before the pick, so picking the same currency again keeps the answers
        if (inputID === CURRENCY_INPUT_ID && typeof value === 'string' && value !== getAnswerCurrency(draftValues ?? {})) {
            startOverWithCurrency(value);
            return;
        }
        const answers = getCurrentSchemaAnswers(schema, draftValues);
        answers[inputID] = value;
        getWiseBankAccountFields(selectedCountry, getAnswerCurrency(answers), answers);
    };

    // The flow keeps the answers when nothing is sent, so the user can tick the terms and confirm again. The tick itself is not sent, as in the Corpay flow.
    const submitForm = (answers: DynamicFormValues) => {
        if (!hasAcceptedTerms) {
            setShouldShowTermsError(true);
            return;
        }
        createWiseBankAccount(selectedCountry, getAnswerCurrency(answers), answers);
    };

    const toggleTerms = (isChecked?: boolean) => {
        setHasAcceptedTerms(!!isChecked);
        setShouldShowTermsError(false);
    };

    // Only the first form takes the whole screen. A refresh keeps the form mounted, so the page keeps what the user typed and shows its progress in place.
    if (wiseBankAccountFields?.isLoading && !schema) {
        return (
            <FullScreenLoadingIndicator
                shouldUseGoBackButton
                onGoBack={leaveFlow}
            />
        );
    }

    // The form state is saved on the device, while the form is only kept in memory. A success left behind by a reload shows the country list instead.
    if (hasSuccessThisVisit && schema) {
        return <WiseBankAccountAdded onContinue={finishFlow} />;
    }

    if (schema) {
        return (
            <DynamicFormFlow
                key={formStartCount}
                schema={schema}
                formID={ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM}
                headerTitle={translate('bankAccount.addBankAccount')}
                confirmationTitle={translate('addPersonalBankAccount.confirmationStepHeader')}
                confirmationSubtitle={translate('addPersonalBankAccount.confirmationStepSubHeader')}
                testID="WiseDepositAccountContent"
                buildRoute={(pageName, action) => ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(backTo, pageName, action)}
                currency={wiseBankAccountFields.currency}
                onRefreshRequirements={refreshForm}
                onSubmit={submitForm}
                isSubmitting={!!formState?.isLoading}
                submitError={getLatestErrorMessage(formState)}
                isRefreshingRequirements={!!wiseBankAccountFields.isLoading}
                refreshError={errorMessage}
                onBack={returnToCountryList}
            >
                <CheckboxWithLabel
                    value={hasAcceptedTerms}
                    onInputChange={toggleTerms}
                    accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('common.addCardTermsOfService')}`}
                    LabelComponent={TermsOfServiceLabel}
                    errorText={shouldShowTermsError ? translate('common.error.acceptTerms') : undefined}
                />
            </DynamicFormFlow>
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
                onConfirm={confirmCountry}
            />
        </ScreenWrapper>
    );
}

export default WiseDepositAccountContent;
