import DynamicFormFlow from '@components/DynamicForm';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {isBankAccountEligibleForGlobalReimbursements} from '@libs/BankAccountUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {saveDraftAnswers} from '@userActions/DynamicForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useState} from 'react';

import US from './forms/US';
import getWiseBusinessOnboardingPrefill, {getMissingPrefill} from './getWiseBusinessOnboardingPrefill';

type WiseBusinessOnboardingPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING>;

/** The business details we collect before Wise's own page: the representative, the business, and a confirmation of both */
function WiseBusinessOnboardingPage({route}: WiseBusinessOnboardingPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const introPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.path);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draft, draftMetadata] = useOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT);
    const bankAccount = bankAccountList?.[bankAccountID];

    const {translate} = useLocalize();
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

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it
    const isWaitingForBankAccount = !bankAccount && !!isLoadingPaymentMethods;
    const isLoading = isLoadingOnyxValue(bankAccountListMetadata, privatePersonalDetailsMetadata, draftMetadata) || isWaitingForBankAccount;
    // The flow's inputs read the draft once, when a page mounts, so the prefill lands in the draft before the flow renders. It runs once per visit, since
    // swapping the flow for a loader later would drop an SSN the user is typing.
    const [isPrefillDone, setIsPrefillDone] = useState(false);
    const missingPrefill = isLoading || isPrefillDone ? {} : getMissingPrefill(getWiseBusinessOnboardingPrefill(bankAccount, privatePersonalDetails), toDynamicFormValues(draft));
    const isPrefillPending = Object.keys(missingPrefill).length > 0;
    if (!isLoading && !isPrefillDone && !isPrefillPending) {
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
            // The terms page comes after the confirmation page, so the SSN stays in memory until the terms page is done with it
            isSubmitting={false}
            onSubmit={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ACCEPT_TERMS.path))}
        />
    );
}

export default WiseBusinessOnboardingPage;
