/**
 * Shows where the business's Wise onboarding stands for one bank account: more info needed, in review, or approved.
 * It opens over the intro after Confirm on the terms page or from any link to the account, and the content updates live when the status changes.
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

import getWiseOnboardingStatusVariant from '@libs/getWiseOnboardingStatusVariant';
import type {WiseOnboardingStatusVariant} from '@libs/getWiseOnboardingStatusVariant';
import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';

import ApprovedContent from './WiseOnboardingStatus/ApprovedContent';
import InReviewContent from './WiseOnboardingStatus/InReviewContent';
import MoreInfoNeededContent from './WiseOnboardingStatus/MoreInfoNeededContent';

type WiseOnboardingStatusPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS>;

const HEADER_TITLES = {
    moreInfoNeeded: 'walletPage.wiseOnboarding.moreInfoNeeded.headerTitle',
    inReview: 'walletPage.wiseOnboarding.inReview.title',
    approved: 'walletPage.wiseOnboarding.approved.title',
} as const satisfies Record<WiseOnboardingStatusVariant, TranslationPaths>;

function WiseOnboardingStatusPage({route}: WiseOnboardingStatusPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const introPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path);
    const entryPath = stripDynamicRouteSuffixFromPath(introPath, DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path);
    // The status is read from the routed bank account, since the reimbursement account can still hold another account's onboarding
    const [onboarding] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {
        selector: (bankAccountList) => ({
            hasBankAccount: !!bankAccountList?.[bankAccountID],
            status: bankAccountList?.[bankAccountID]?.accountData?.additionalData?.wise?.status,
        }),
    });
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

    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToEntryPoint();
    }, [isWiseReimbursementsBetaEnabled, goBackToEntryPoint]);

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it before judging the account
    const isWaitingForBankAccount = !onboarding?.hasBankAccount && !!isLoadingPaymentMethods;

    if (isWaitingForBankAccount || !isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    const variant = getWiseOnboardingStatusVariant(onboarding?.status);

    return (
        <ScreenWrapper
            testID="WiseOnboardingStatusPage"
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView
                shouldShow={!onboarding?.hasBankAccount}
                onBackButtonPress={goBackToEntryPoint}
            >
                <Header>
                    <Header.BackButton onPress={goBackToEntryPoint} />
                    <Header.Title title={translate(HEADER_TITLES[variant])} />
                </Header>
                {variant === 'moreInfoNeeded' && <MoreInfoNeededContent bankAccountID={bankAccountID} />}
                {variant === 'inReview' && <InReviewContent onDone={goBackToEntryPoint} />}
                {variant === 'approved' && <ApprovedContent onDone={goBackToEntryPoint} />}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseOnboardingStatusPage;
