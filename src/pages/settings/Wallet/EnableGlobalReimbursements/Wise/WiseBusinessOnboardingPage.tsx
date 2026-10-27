import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DynamicFormFlow from '@components/DynamicForm';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {setDraftValues} from '@libs/actions/FormActions';
import {updateWiseOnboardingAdditionalData} from '@libs/actions/Wise';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect} from 'react';

import US from './forms/US';

type WiseBusinessOnboardingPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_BUSINESS_ONBOARDING>;

/** The business details we collect before Wise's own page: the representative, the business, and a confirmation of both */
function WiseBusinessOnboardingPage({route}: WiseBusinessOnboardingPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);
    const [draft, draftMetadata] = useOnyx(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT);
    const bankAccount = bankAccountList?.[bankAccountID];
    const companyName = bankAccount?.accountData?.addressName;

    const {translate} = useLocalize();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);

    const goBackToWallet = () => Navigation.goBack(ROUTES.SETTINGS_WALLET);

    // Close the page instead of showing "not found" when the user lacks the beta. Wait for betas to load first
    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToWallet();
    }, [isWiseReimbursementsBetaEnabled, goBackToWallet]);

    // The legal business name is a read-only row filled from the verified bank account
    useEffect(() => {
        if (isLoadingOnyxValue(draftMetadata) || !companyName || draft?.companyName === companyName) {
            return;
        }
        setDraftValues(ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM, {companyName});
    }, [draftMetadata, companyName, draft?.companyName]);

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it
    const isWaitingForBankAccount = !bankAccount && !!isLoadingPaymentMethods;

    if (isLoadingOnyxValue(bankAccountListMetadata) || isWaitingForBankAccount || !isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (!bankAccount) {
        return (
            <FullPageNotFoundView
                onBackButtonPress={goBackToWallet}
                shouldShow
            />
        );
    }

    return (
        <DynamicFormFlow
            schema={US}
            formID={ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM}
            headerTitle={translate('walletPage.wiseOnboarding.headerTitle')}
            confirmationTitle={translate('walletPage.wiseOnboarding.confirmationTitle')}
            testID="WiseBusinessOnboardingPage"
            layout="pages"
            buildRoute={(pageName, action) => ROUTES.SETTINGS_WALLET_WISE_BUSINESS_ONBOARDING.getRoute(bankAccountID, pageName, action)}
            onBack={goBackToWallet}
            onPageSubmit={(page, answers) => {
                const fileKeys = page.content.filter((item) => 'type' in item && item.type === 'file').map((item) => item.key);
                updateWiseOnboardingAdditionalData(bankAccountID, page.key, answers, fileKeys);
            }}
            onSubmit={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_WISE_ACCEPT_TERMS.getRoute(bankAccountID))}
        />
    );
}

export default WiseBusinessOnboardingPage;
