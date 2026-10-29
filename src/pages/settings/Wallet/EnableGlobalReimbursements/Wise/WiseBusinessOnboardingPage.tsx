import DynamicFormFlow from '@components/DynamicForm';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {isBankAccountEligibleForGlobalReimbursements} from '@libs/BankAccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {hideBankAccountErrors, openReimbursementAccountPage} from '@userActions/BankAccounts';
import {clearSensitiveAnswers, saveDraftAnswers} from '@userActions/DynamicForm';
import {clearDraftValues} from '@userActions/FormActions';
import updateWiseOnboardingAdditionalData, {clearWiseOnboardingFailedPages} from '@userActions/WiseOnboarding';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReimbursementAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {deepEqual} from 'fast-equals';
import pick from 'lodash/pick';
import React, {useEffect, useState} from 'react';

import US from './forms/US';
import getWiseBusinessOnboardingPrefill, {getMissingPrefill, WISE_BUSINESS_ACCOUNT_KEYS} from './getWiseBusinessOnboardingPrefill';
import getWiseOnboardingPageParams, {getSavedFileAnswers} from './getWiseOnboardingPageParams';

type WiseBusinessOnboardingPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING>;

const businessAccountSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => ({
    isLoading: !!reimbursementAccount?.isLoading,
    data: reimbursementAccount?.achData ? pick(reimbursementAccount.achData, WISE_BUSINESS_ACCOUNT_KEYS) : undefined,
});

const saveErrorSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => getLatestErrorMessage(reimbursementAccount);

const isSavingPageSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => !!reimbursementAccount?.isSavingWiseOnboardingPage;

const hasFailedPageSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => Object.values(reimbursementAccount?.wiseOnboardingFailedPages ?? {}).some(Boolean);

/** The business details we collect before Wise's own page: the representative, the business, and a confirmation of both */
function WiseBusinessOnboardingPage({route}: WiseBusinessOnboardingPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const introPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.path);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draft, draftMetadata] = useOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT);
    const [businessAccount, businessAccountMetadata] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: businessAccountSelector});
    const [saveError] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: saveErrorSelector});
    const [isSavingPage] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: isSavingPageSelector});
    const [hasFailedPage] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: hasFailedPageSelector});
    const bankAccount = bankAccountList?.[bankAccountID];

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);

    const goBackToIntro = () => Navigation.goBack(introPath);

    // Close the page instead of showing "not found" when the user lacks the beta. Wait for betas to load first
    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToIntro();
    }, [isWiseReimbursementsBetaEnabled, goBackToIntro]);

    // The flow's inputs read the draft once, when a page mounts, so the prefill lands in the draft before the flow renders. It runs once per visit, since
    // swapping the flow for a loader later would drop an SSN the user is typing.
    const [isPrefillDone, setIsPrefillDone] = useState(false);

    // The company details come from the reimbursement account, which the server fills for one bank account at a time. Next and Back replace the route,
    // which mounts the page again, so only a visit that opens without a page reads them. A read is not queued offline, so an offline visit uses what the
    // device holds.
    const [isNewVisit] = useState(!route.params.subPage);
    const shouldReadBusinessAccount = isNewVisit && !isOffline;
    const [hasBusinessAccountReadStarted, setHasBusinessAccountReadStarted] = useState(false);

    // The reimbursement account's errors are shared with the other bank account flows, so a new visit drops any left from them or from an earlier visit
    useEffect(() => {
        if (!isNewVisit) {
            return;
        }
        hideBankAccountErrors();
    }, [isNewVisit]);
    if (businessAccount?.isLoading && !hasBusinessAccountReadStarted) {
        setHasBusinessAccountReadStarted(true);
    }
    useEffect(() => {
        if (!shouldReadBusinessAccount || hasBusinessAccountReadStarted || isPrefillDone) {
            return;
        }
        openReimbursementAccountPage({bankAccountID});
    }, [bankAccountID, shouldReadBusinessAccount, hasBusinessAccountReadStarted, isPrefillDone]);
    const isWaitingForBusinessAccount = shouldReadBusinessAccount && (!hasBusinessAccountReadStarted || !!businessAccount?.isLoading);

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it
    const isWaitingForBankAccount = !bankAccount && !!isLoadingPaymentMethods;
    const isLoading =
        isLoadingOnyxValue(bankAccountListMetadata, privatePersonalDetailsMetadata, draftMetadata, businessAccountMetadata) || isWaitingForBankAccount || isWaitingForBusinessAccount;

    // The draft holds the answers for one bank account, so a visit for another account starts it over
    const draftBankAccountID = String(bankAccountID);
    const isDraftForOtherAccount = !isLoading && !isPrefillDone && !!draft && draft.bankAccountID !== draftBankAccountID;
    useEffect(() => {
        if (!isDraftForOtherAccount) {
            return;
        }
        clearDraftValues(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        clearSensitiveAnswers(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        clearWiseOnboardingFailedPages();
    }, [isDraftForOtherAccount]);

    // After a save, the draft still holds the files picked on this device, so the next save of that page would upload them again. Once the server's file
    // keys change and no save is running, the draft takes them instead. Only changes count, since the keys a page opens with may predate its newest files.
    const savedDocuments = businessAccount?.data?.bankAccountID === bankAccountID ? businessAccount.data.wise?.documents : undefined;
    const [draftedSavedDocuments, setDraftedSavedDocuments] = useState(savedDocuments);
    const [haveSavedDocumentsChanged, setHaveSavedDocumentsChanged] = useState(false);
    if (!isSavingPage && !deepEqual(savedDocuments, draftedSavedDocuments)) {
        setDraftedSavedDocuments(savedDocuments);
        setHaveSavedDocumentsChanged(true);
    }
    useEffect(() => {
        if (!haveSavedDocumentsChanged) {
            return;
        }
        saveDraftAnswers(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, getSavedFileAnswers(draftedSavedDocuments));
    }, [haveSavedDocumentsChanged, draftedSavedDocuments]);

    const missingPrefill =
        isLoading || isPrefillDone || isDraftForOtherAccount
            ? {}
            : getMissingPrefill(
                  {...getWiseBusinessOnboardingPrefill(bankAccountID, businessAccount?.data, privatePersonalDetails), bankAccountID: draftBankAccountID},
                  toDynamicFormValues(draft),
              );
    const isPrefillPending = Object.keys(missingPrefill).length > 0;
    if (!isLoading && !isPrefillDone && !isDraftForOtherAccount && !isPrefillPending) {
        setIsPrefillDone(true);
    }

    useEffect(() => {
        if (!isPrefillPending) {
            return;
        }
        saveDraftAnswers(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, missingPrefill);
    }, [isPrefillPending, missingPrefill]);

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
            buildRoute={(pageName, action) => createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute(pageName, action), introPath)}
            shouldReplaceRoute
            onBack={goBackToIntro}
            // Each page is saved to Wise as the user leaves it, so a later visit resumes from what the server holds
            onPageSubmit={(page, answers, sensitiveAnswers) => {
                const {params, hasSensitiveAnswers} = getWiseOnboardingPageParams(bankAccountID, page, answers, sensitiveAnswers);
                updateWiseOnboardingAdditionalData(params, hasSensitiveAnswers);
            }}
            // A later page's save clears the shared error, so a page that still failed shows the generic one
            submitError={saveError || (hasFailedPage && !isSavingPage ? translate('common.genericErrorMessage') : undefined)}
            // The terms page comes after the confirmation page, so the SSN stays in memory until the terms page is done with it
            isSubmitting={false}
            onSubmit={() => {
                // A page save that is still running or has failed would leave Wise without that page, so the user stays on the confirmation page
                if (isSavingPage || saveError || hasFailedPage) {
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ACCEPT_TERMS.path));
            }}
        />
    );
}

export default WiseBusinessOnboardingPage;
