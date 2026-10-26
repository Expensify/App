import DynamicFormFlow from '@components/DynamicForm';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {isBankAccountEligibleForGlobalReimbursements} from '@libs/BankAccountUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {openReimbursementAccountPage} from '@userActions/BankAccounts';
import {saveDraftAnswers} from '@userActions/DynamicForm';
import {clearErrors} from '@userActions/FormActions';
import {updateWiseOnboardingAdditionalData} from '@userActions/Wise';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReimbursementAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';

import US from './forms/US';
import getPageWithServerError from './getPageWithServerError';
import getWiseBusinessOnboardingPrefill, {getMissingPrefill} from './getWiseBusinessOnboardingPrefill';
import getWiseSavedAnswers, {getOutdatedDraftAnswers} from './getWiseSavedAnswers';

type WiseBusinessOnboardingPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING>;

const savedOnboardingSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => ({
    isLoading: !!reimbursementAccount?.isLoading,
    bankAccountID: reimbursementAccount?.achData?.bankAccountID,
    wise: reimbursementAccount?.achData?.wise,
});

/** The business details we collect before Wise's own page: the representative, the business, and a confirmation of both */
function WiseBusinessOnboardingPage({route}: WiseBusinessOnboardingPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const introPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.path);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draft, draftMetadata] = useOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT);
    const [savedOnboarding] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: savedOnboardingSelector});
    const [serverErrorFields] = useOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {selector: (form) => form?.errorFields});
    const bankAccount = bankAccountList?.[bankAccountID];

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);

    const goBackToIntro = () => Navigation.goBack(introPath);
    const buildRoute = (pageName: string, action?: 'edit') => createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute(pageName, action), introPath);

    // Close the page instead of showing "not found" when the user lacks the beta. Wait for betas to load first
    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToIntro();
    }, [isWiseReimbursementsBetaEnabled, goBackToIntro]);

    // Next and Back replace the route, which mounts the page again, so only a visit that opens without a page, as from Get started, starts from the server
    const [isNewVisit] = useState(!route.params.subPage);

    // A failed save blocks the form's Next until an answer changes, so an earlier visit's failure does not carry over. Field errors stay, so the flow can return to them.
    useEffect(() => {
        if (!isNewVisit) {
            return;
        }
        clearErrors(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
    }, [isNewVisit]);

    // The flow's inputs read the draft once, when a page mounts, so the prefill and the saved answers land in the draft before the flow renders. It runs once
    // per visit, since swapping the flow for a loader later would drop an SSN the user is typing.
    const [isPrefillDone, setIsPrefillDone] = useState(false);

    // The server sends the admin's saved answers with the reimbursement account. Reads wait for queued writes, so this one includes every page saved offline.
    // The first page stays mounted, so a reconnect after the prefill would read again for nothing.
    const shouldReadSavedAnswers = isNewVisit && !isOffline;
    useEffect(() => {
        if (!shouldReadSavedAnswers || isPrefillDone) {
            return;
        }
        openReimbursementAccountPage({bankAccountID});
    }, [bankAccountID, shouldReadSavedAnswers, isPrefillDone]);

    // Until this visit's read returns, the reimbursement account can hold another account or older answers
    const [hasSavedAnswersReadStarted, setHasSavedAnswersReadStarted] = useState(false);
    if (savedOnboarding?.isLoading && !hasSavedAnswersReadStarted) {
        setHasSavedAnswersReadStarted(true);
    }
    const isWaitingForSavedAnswers = shouldReadSavedAnswers && (!hasSavedAnswersReadStarted || !!savedOnboarding?.isLoading);
    // Offline, the answers in Onyx can be older than the draft, whose page saves are still queued
    const savedAnswers = shouldReadSavedAnswers && savedOnboarding?.bankAccountID === bankAccountID ? getWiseSavedAnswers(savedOnboarding.wise) : {};

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it
    const isWaitingForBankAccount = !bankAccount && !!isLoadingPaymentMethods;
    const isLoading = isLoadingOnyxValue(bankAccountListMetadata, privatePersonalDetailsMetadata, draftMetadata) || isWaitingForBankAccount || isWaitingForSavedAnswers;
    const draftValues = toDynamicFormValues(draft);
    const pendingAnswers =
        isLoading || isPrefillDone
            ? {}
            : {...getMissingPrefill(getWiseBusinessOnboardingPrefill(bankAccount, privatePersonalDetails), draftValues), ...getOutdatedDraftAnswers(savedAnswers, draftValues)};
    const hasPendingAnswers = Object.keys(pendingAnswers).length > 0;
    if (!isLoading && !isPrefillDone && !hasPendingAnswers) {
        setIsPrefillDone(true);
    }

    useEffect(() => {
        if (!hasPendingAnswers) {
            return;
        }
        saveDraftAnswers(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, pendingAnswers);
    }, [hasPendingAnswers, pendingAnswers]);

    // The server rejects a page save after the user has moved on, so the flow goes back to the page holding the rejected answers
    const pageWithServerError = getPageWithServerError(serverErrorFields);
    useEffect(() => {
        if (!isFocused || !isPrefillDone || !pageWithServerError || pageWithServerError.key === route.params.subPage) {
            return;
        }
        Navigation.navigate(buildRoute(pageWithServerError.key), {forceReplace: true});
    }, [isFocused, isPrefillDone, pageWithServerError, route.params.subPage, buildRoute]);

    if (!isPrefillDone || !isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (!isBankAccountEligibleForGlobalReimbursements(bankAccount?.accountData, bankAccount?.bankCurrency)) {
        return <NotFoundPage onBackButtonPress={goBackToIntro} />;
    }

    return (
        <DynamicFormFlow
            schema={US}
            formID={ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM}
            headerTitle={translate('walletPage.wiseGlobalReimbursementsIntro.headerTitle')}
            confirmationTitle={translate('walletPage.wiseOnboarding.confirmationTitle')}
            testID="WiseBusinessOnboardingPage"
            layout="pages"
            maxFileSize={CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE}
            buildRoute={buildRoute}
            shouldReplaceRoute
            onBack={goBackToIntro}
            onPageSubmit={(page, answers) => updateWiseOnboardingAdditionalData(bankAccountID, page, answers)}
            // The terms page comes after the confirmation page, so the SSN stays in memory until the terms page is done with it
            isSubmitting={false}
            onSubmit={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ACCEPT_TERMS.path))}
        />
    );
}

export default WiseBusinessOnboardingPage;
