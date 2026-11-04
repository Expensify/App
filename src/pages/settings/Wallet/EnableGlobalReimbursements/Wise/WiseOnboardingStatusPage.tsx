/**
 * Shows where the business's Wise onboarding stands for one bank account: in review, approved, or rejected.
 * It opens over the intro and shows the status the bank account holds. Wise also sends the user here when its KYC form ends.
 */
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {markWiseKYCReviewSubmitted} from '@userActions/Wise';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ReactNode} from 'react';

import React, {useEffect} from 'react';

import ApprovedContent from './WiseOnboardingStatus/ApprovedContent';
import InReviewContent from './WiseOnboardingStatus/InReviewContent';
import RejectedContent from './WiseOnboardingStatus/RejectedContent';

type WiseOnboardingStatusPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS>;

function WiseOnboardingStatusPage({route}: WiseOnboardingStatusPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const introPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path);
    const entryPath = stripDynamicRouteSuffixFromPath(introPath, DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path);
    const kycReviewFormStatus = route.params.status;
    const [hasBankAccount] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (bankAccountList) => !!bankAccountList?.[bankAccountID]});
    const [onboardingStatus] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (bankAccountList) => bankAccountList?.[bankAccountID]?.accountData?.additionalData?.wise?.status});
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);

    const {translate} = useLocalize();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);

    // The flow is finished on our side, so leaving it skips the intro and lands on the screen that opened the flow instead of reopening the form
    const goBackToEntryPoint = () => Navigation.goBack(entryPath);

    // The intro is the screen underneath, so Android's back takes the header's step instead of popping to it
    useAndroidBackButtonHandler(() => {
        goBackToEntryPoint();
        return true;
    });

    // Close the page instead of showing "not found" when the user lacks the beta. Wait for betas to load first, since undefined means they are still loading
    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToEntryPoint();
    }, [isWiseReimbursementsBetaEnabled, goBackToEntryPoint]);

    // Wise reloads the app here with how its KYC form ended, so the page applies it once and drops it from the URL, which keeps a reload from applying it again
    useEffect(() => {
        if (!kycReviewFormStatus || !hasBankAccount) {
            return;
        }
        if (kycReviewFormStatus !== CONST.WISE.KYC_REVIEW_REDIRECT_STATUS_SUCCESS) {
            // The form was closed or failed, so the user goes back to the page that opens it again
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_MORE_INFO_NEEDED.path, introPath), {forceReplace: true});
            return;
        }
        markWiseKYCReviewSubmitted(bankAccountID);
        Navigation.setParams({status: undefined});
    }, [kycReviewFormStatus, hasBankAccount, bankAccountID, introPath]);

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it before judging the account
    const isWaitingForBankAccount = !hasBankAccount && !!isLoadingPaymentMethods;

    if (isWaitingForBankAccount || !isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    let title: TranslationPaths;
    let content: ReactNode;
    switch (onboardingStatus) {
        case CONST.WISE.ONBOARDING_STATUS.APPROVED:
            title = 'walletPage.wiseOnboarding.approved.title';
            content = <ApprovedContent onDone={goBackToEntryPoint} />;
            break;
        case CONST.WISE.ONBOARDING_STATUS.NOT_APPROVED:
            title = 'walletPage.wiseOnboarding.rejected.title';
            content = <RejectedContent onDone={goBackToEntryPoint} />;
            break;
        default:
            // Any other status shows the review, since that is what follows the form right before the review status reaches the account
            title = 'walletPage.wiseOnboarding.inReview.title';
            content = <InReviewContent onDone={goBackToEntryPoint} />;
    }

    return (
        <ScreenWrapper
            testID="WiseOnboardingStatusPage"
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView
                shouldShow={!hasBankAccount}
                onBackButtonPress={goBackToEntryPoint}
            >
                <Header>
                    <Header.BackButton onPress={goBackToEntryPoint} />
                    <Header.Title title={translate(title)} />
                </Header>
                {content}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseOnboardingStatusPage;
