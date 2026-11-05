/**
 * Shows where the business's Wise onboarding stands for one bank account: more info needed, in review, approved, or rejected.
 * It opens over the intro and shows the status the bank account holds. Wise also sends the user here when its KYC form ends.
 */
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useWiseOnboardingEntryPath from '@hooks/useWiseOnboardingEntryPath';

import getWiseOnboardingStatusRoute from '@libs/Navigation/helpers/getWiseOnboardingStatusRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {setOptimisticWiseOnboardingInReview} from '@userActions/Wise';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import type {ReactNode} from 'react';

import React, {useEffect} from 'react';

import ApprovedContent from './WiseOnboardingStatus/ApprovedContent';
import InReviewContent from './WiseOnboardingStatus/InReviewContent';
import MoreInfoNeededContent from './WiseOnboardingStatus/MoreInfoNeededContent';
import RejectedContent from './WiseOnboardingStatus/RejectedContent';

type WiseOnboardingStatusPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS>;

function WiseOnboardingStatusPage({route, navigation}: WiseOnboardingStatusPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const entryPath = useWiseOnboardingEntryPath();
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
        // Only an onboarding still waiting for Wise's form takes its outcome, so an old redirect does not overwrite a status the server sent since
        if (kycReviewFormStatus === CONST.WISE.KYC_REVIEW_REDIRECT_STATUS_SUCCESS && onboardingStatus === CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED) {
            setOptimisticWiseOnboardingInReview(bankAccountID);
        }
        // The screen's own navigation reaches the route even on a cold start, when the navigators above it are not listening yet
        navigation.setParams({status: undefined});
    }, [kycReviewFormStatus, hasBankAccount, onboardingStatus, bankAccountID, navigation]);

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it before judging the account
    const isWaitingForBankAccount = !hasBankAccount && !!isLoadingPaymentMethods;

    if (isWaitingForBankAccount || !isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    let title: TranslationPaths;
    let content: ReactNode;
    switch (onboardingStatus) {
        case CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED:
            title = 'walletPage.wiseOnboarding.moreInfoNeeded.headerTitle';
            content = (
                <MoreInfoNeededContent
                    bankAccountID={bankAccountID}
                    // Wallet and Home open this page without the intro on the stack, so the path is built over the entry screen instead of read from the stack
                    statusPath={getWiseOnboardingStatusRoute(bankAccountID, entryPath)}
                />
            );
            break;
        case CONST.WISE.ONBOARDING_STATUS.APPROVED:
            title = 'walletPage.wiseOnboarding.approved.title';
            content = <ApprovedContent onDone={goBackToEntryPoint} />;
            break;
        case CONST.WISE.ONBOARDING_STATUS.NOT_APPROVED:
            title = 'walletPage.wiseOnboarding.rejected.title';
            content = <RejectedContent onDone={goBackToEntryPoint} />;
            break;
        default:
            // A business without a status reaches this page only by a link, so it shows the review like right after the form
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
