import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DynamicFormFlow from '@components/DynamicForm';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useWiseOnboardingSaveStatus from '@hooks/useWiseOnboardingSaveStatus';

import {isBankAccountEligibleForGlobalReimbursements, isWiseOnboardingSubmitted} from '@libs/BankAccountUtils';
import {getSavedFileAnswers} from '@libs/getWiseOnboardingPageParams';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {isWiseGlobalReimbursementsIntroPath} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {hideBankAccountErrors, openReimbursementAccountPage} from '@userActions/BankAccounts';
import {clearSensitiveAnswers, saveDraftAnswers} from '@userActions/DynamicForm';
import {clearDraftValues} from '@userActions/FormActions';
import saveWiseOnboardingPage, {clearWiseOnboardingUnsavedPages} from '@userActions/WiseOnboarding';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReimbursementAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {deepEqual} from 'fast-equals';
import pick from 'lodash/pick';
import React, {useEffect, useEffectEvent, useState} from 'react';

import US from './forms/US';
import getWiseBusinessOnboardingPrefill, {getMissingPrefill, WISE_BUSINESS_ACCOUNT_KEYS} from './getWiseBusinessOnboardingPrefill';

type WiseBusinessOnboardingPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING>;

const businessAccountSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => ({
    isLoading: !!reimbursementAccount?.isLoading,
    data: reimbursementAccount?.achData ? pick(reimbursementAccount.achData, WISE_BUSINESS_ACCOUNT_KEYS) : undefined,
});

/** The draft key that holds the server's file keys, as JSON, that the draft's file answers last took */
const SAVED_DOCUMENTS_DRAFT_KEY = 'savedDocuments';

/** The business details we collect before Wise's own page: the representative, the business, and a confirmation of both */
function WiseBusinessOnboardingPage({route}: WiseBusinessOnboardingPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const introPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.path);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draft, draftMetadata] = useOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT);
    const [businessAccount, businessAccountMetadata] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: businessAccountSelector});
    const {isSaving, saveError, unsavedPageKeys} = useWiseOnboardingSaveStatus();
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

    // A submitted business has nothing left to submit, and the back path follows the focused route, so introPath stays out of the effect and the status page opens once
    const isOnboardingSubmitted = isWiseOnboardingSubmitted(bankAccount?.accountData);
    const openStatusPage = useEffectEvent(() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path, introPath), {forceReplace: true}));
    // A deep link renders this page before the root state holds it, so the back path is not this account's intro until then
    const isIntroPathReady = isWiseGlobalReimbursementsIntroPath(introPath, bankAccountID);
    useEffect(() => {
        if (!isOnboardingSubmitted || !isIntroPathReady) {
            return;
        }
        openStatusPage();
    }, [isOnboardingSubmitted, isIntroPathReady]);

    // The flow's inputs read the draft once, when a page mounts, so the prefill lands in the draft before the flow renders. It runs once per visit, since
    // swapping the flow for a loader later would drop an SSN the user is typing.
    const [isPrefillDone, setIsPrefillDone] = useState(false);

    // The company details come from the reimbursement account, which the server fills for one bank account at a time. Next and Back replace the route,
    // which mounts the page again, so only a visit that opens without a page reads them. A read is not queued offline, so an offline visit uses what the
    // device holds.
    const [isNewVisit] = useState(!route.params.subPage);
    const shouldReadBusinessAccount = isNewVisit && !isOffline && !isOnboardingSubmitted;
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

    // The prefill runs once per visit, so a visit that opens offline without this bank account or its details would start from blank business rows and
    // without the pages already saved to Wise, and keep them once the connection returns. It waits for the connection instead, as bank account setup does.
    // Next and Back mount the page again mid-visit, after the prefill, so they are left to the flow.
    const hasBusinessAccountOnDevice = !!bankAccount && businessAccount?.data?.bankAccountID === bankAccountID;
    const isWaitingForConnection = isOffline && isNewVisit && !isPrefillDone && !hasBusinessAccountOnDevice;
    const isLoading =
        isLoadingOnyxValue(bankAccountListMetadata, privatePersonalDetailsMetadata, draftMetadata, businessAccountMetadata) ||
        isWaitingForBankAccount ||
        isWaitingForBusinessAccount ||
        isWaitingForConnection ||
        isOnboardingSubmitted;

    // The draft holds the answers for one bank account, so a visit for another account starts it over
    const draftBankAccountID = String(bankAccountID);
    const isDraftForOtherAccount = !isLoading && !isPrefillDone && !!draft && draft.bankAccountID !== draftBankAccountID;
    useEffect(() => {
        if (!isDraftForOtherAccount) {
            return;
        }
        clearDraftValues(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        clearSensitiveAnswers(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM);
        clearWiseOnboardingUnsavedPages();
    }, [isDraftForOtherAccount]);

    // After a save, the draft still holds the files picked on this device, so the next save of that page would upload them again, or drop them once they
    // can no longer be read, which tells the server to delete them. Once the server's file keys change and no save is running, the draft takes them instead.
    // Only changes count, since the keys a page opens with may predate its newest files. The draft records the keys it last took, so a change that lands
    // while another page saves, before Next or Back mounts the page again, or while the flow is closed is still taken. A page that has not saved keeps its
    // local files, since the server still holds its older ones, and takes the server's keys once a later save of it changes them.
    const savedDocuments = businessAccount?.data?.bankAccountID === bankAccountID ? businessAccount.data.wise?.documents : undefined;
    const savedDocumentsRecord = JSON.stringify(savedDocuments ?? {});
    const draftedSavedDocumentsRecord = draft?.[SAVED_DOCUMENTS_DRAFT_KEY];
    const haveSavedDocumentsChanged =
        isPrefillDone && !isSaving && typeof draftedSavedDocumentsRecord === 'string' && !deepEqual(JSON.parse(draftedSavedDocumentsRecord) as unknown, savedDocuments ?? {});
    useEffect(() => {
        if (!haveSavedDocumentsChanged) {
            return;
        }
        saveDraftAnswers(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {...getSavedFileAnswers(savedDocuments, unsavedPageKeys), [SAVED_DOCUMENTS_DRAFT_KEY]: savedDocumentsRecord});
    }, [haveSavedDocumentsChanged, savedDocuments, savedDocumentsRecord, unsavedPageKeys]);

    // The prefill already puts the server's files in the draft, so it records their keys too. A local file in a draft that predates the record is kept.
    const missingPrefill =
        isLoading || isPrefillDone || isDraftForOtherAccount
            ? {}
            : getMissingPrefill(
                  {
                      ...getWiseBusinessOnboardingPrefill(bankAccountID, businessAccount?.data, privatePersonalDetails),
                      bankAccountID: draftBankAccountID,
                      [SAVED_DOCUMENTS_DRAFT_KEY]: savedDocumentsRecord,
                  },
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

    if (isWaitingForConnection) {
        return (
            <ScreenWrapper testID="WiseBusinessOnboardingPage">
                <Header>
                    <Header.BackButton onPress={goBackToIntro} />
                    <Header.Title title={translate('walletPage.wiseGlobalReimbursementsIntro.headerTitle')} />
                </Header>
                <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>
            </ScreenWrapper>
        );
    }

    if (!isPrefillDone || !isWiseReimbursementsBetaEnabled || isOnboardingSubmitted) {
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
            onPageSubmit={(page, answers, sensitiveAnswers) => saveWiseOnboardingPage(bankAccountID, page, answers, sensitiveAnswers)}
            // No page saves offline, so a typed SSN never waits for a connection and a later visit never resumes from a save the server has not seen
            shouldDisableNextWhenOffline
            submitError={saveError}
            // Confirm waits while a page is saving, and a visit after a page did not save opens on that page
            isSavingPages={isSaving}
            unsavedPageKeys={unsavedPageKeys}
            // The terms page comes after the confirmation page, so the SSN stays in memory until the terms page is done with it
            isSubmitting={false}
            onSubmit={() => {
                // A page that is still saving or did not save would leave Wise without it, so the user stays on the confirmation page
                if (isSaving || saveError) {
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ACCEPT_TERMS.path, introPath), {forceReplace: true});
            }}
        />
    );
}

export default WiseBusinessOnboardingPage;
