import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import FailedKYC from '@pages/EnablePayments/shared/FailedKYC';
import {openEnablePaymentsPage} from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ActivateStep from './Activate/ActivateStep';
import AdditionalDetailsStep from './AdditionalDetails/AdditionalDetailsStep';
// Steps
import OnfidoStep from './Onfido/OnfidoStep';
import TermsStep from './Terms/TermsStep';

function EnablePaymentsPage() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);

    const {isPendingOnfidoResult, hasFailedOnfido} = userWallet ?? {};
    const [hasFreshData] = useOnyx(ONYXKEYS.RAM_ONLY_HAS_FRESH_WALLET_DATA);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        if (hasFreshData) {
            return;
        }
        if (userWallet?.isLoading) {
            return;
        }

        openEnablePaymentsPage();
        // userWallet.isLoading is intentionally omitted from the dependencies,
        // as reacting to it would endlessly retry a failed fetch
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline, hasFreshData]);

    // Only redirect after the fresh data loading cycle (isLoading: true → false) completes,
    // to avoid acting on stale cached values from a previous session.
    useEffect(() => {
        if (isOffline || !hasFreshData) {
            return;
        }

        if (isPendingOnfidoResult || hasFailedOnfido) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET, {forceReplace: true});
        }
    }, [isOffline, isPendingOnfidoResult, hasFailedOnfido, hasFreshData]);

    const isUserWalletEmpty = isEmptyObject(userWallet);
    if (isUserWalletEmpty || userWallet?.isLoading || (!hasFreshData && !isOffline)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'EnablePaymentsPage',
            isUserWalletEmpty,
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={userWallet?.currentStep !== CONST.WALLET.STEP.ONFIDO}
            includeSafeAreaPaddingBottom
            testID="EnablePaymentsPage"
        >
            {() => {
                if (userWallet?.errorCode === CONST.WALLET.ERROR.KYC) {
                    return (
                        <>
                            <HeaderWithBackButton
                                title={translate('additionalDetailsStep.headerTitle')}
                                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                            />
                            <FailedKYC />
                        </>
                    );
                }

                const currentStep = userWallet?.currentStep || CONST.WALLET.STEP.ADDITIONAL_DETAILS;

                switch (currentStep) {
                    case CONST.WALLET.STEP.ADDITIONAL_DETAILS:
                    case CONST.WALLET.STEP.ADDITIONAL_DETAILS_KBA:
                        return <AdditionalDetailsStep />;
                    case CONST.WALLET.STEP.ONFIDO:
                        return <OnfidoStep />;
                    case CONST.WALLET.STEP.TERMS:
                        return <TermsStep userWallet={userWallet} />;
                    case CONST.WALLET.STEP.ACTIVATE:
                        return <ActivateStep userWallet={userWallet} />;
                    default:
                        return null;
                }
            }}
        </ScreenWrapper>
    );
}

export default EnablePaymentsPage;
