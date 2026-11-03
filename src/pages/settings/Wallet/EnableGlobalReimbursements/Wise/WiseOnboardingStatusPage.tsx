/**
 * Shows where the business's Wise onboarding stands for one bank account: in review, approved, or rejected.
 * It opens over the intro, and the `status` query param picks the content.
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

import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React, {useEffect} from 'react';

import ApprovedContent from './WiseOnboardingStatus/ApprovedContent';
import InReviewContent from './WiseOnboardingStatus/InReviewContent';
import RejectedContent from './WiseOnboardingStatus/RejectedContent';

type WiseOnboardingStatusPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ONBOARDING_STATUS>;

type WiseOnboardingStatusPageStatus = ValueOf<typeof CONST.WISE.ONBOARDING_STATUS_PAGE>;

const HEADER_TITLES = {
    [CONST.WISE.ONBOARDING_STATUS_PAGE.REVIEW]: 'walletPage.wiseOnboarding.inReview.title',
    [CONST.WISE.ONBOARDING_STATUS_PAGE.APPROVED]: 'walletPage.wiseOnboarding.approved.title',
    [CONST.WISE.ONBOARDING_STATUS_PAGE.REJECTED]: 'walletPage.wiseOnboarding.rejected.title',
} as const satisfies Record<WiseOnboardingStatusPageStatus, TranslationPaths>;

/**
 * A missing or unknown status shows the in review content, since that is what the admin sees right after submitting.
 */
function getStatus(status: string | undefined): WiseOnboardingStatusPageStatus {
    return Object.values(CONST.WISE.ONBOARDING_STATUS_PAGE).find((value) => value === status) ?? CONST.WISE.ONBOARDING_STATUS_PAGE.REVIEW;
}

function WiseOnboardingStatusPage({route}: WiseOnboardingStatusPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const introPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path);
    const entryPath = stripDynamicRouteSuffixFromPath(introPath, DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path);
    const status = getStatus(route.params.status);
    const [hasBankAccount] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (bankAccountList) => !!bankAccountList?.[bankAccountID]});
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

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it before judging the account
    const isWaitingForBankAccount = !hasBankAccount && !!isLoadingPaymentMethods;

    if (isWaitingForBankAccount || !isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
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
                    <Header.Title title={translate(HEADER_TITLES[status])} />
                </Header>
                {status === CONST.WISE.ONBOARDING_STATUS_PAGE.REVIEW && <InReviewContent onDone={goBackToEntryPoint} />}
                {status === CONST.WISE.ONBOARDING_STATUS_PAGE.APPROVED && <ApprovedContent onDone={goBackToEntryPoint} />}
                {status === CONST.WISE.ONBOARDING_STATUS_PAGE.REJECTED && <RejectedContent onDone={goBackToEntryPoint} />}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseOnboardingStatusPage;
