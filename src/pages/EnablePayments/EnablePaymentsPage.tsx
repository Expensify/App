import React, {useEffect, useRef} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {openEnablePaymentsPage} from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ActivateStep from './ActivateStep';
import AdditionalDetailsStep from './AdditionalDetailsStep';
import FailedKYC from './FailedKYC';
// Steps
import OnfidoStep from './OnfidoStep';
import TermsStep from './TermsStep';

function EnablePaymentsPage() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);

    const {isPendingOnfidoResult, hasFailedOnfido} = userWallet ?? {};
    const wasLoadingRef = useRef(false);

    // Always fetch fresh wallet data on mount
    useEffect(() => {
        if (isOffline) {
            return;
        }

        openEnablePaymentsPage();
    }, [isOffline]);

    // Only redirect after the fresh data loading cycle (isLoading: true → false) completes,
    // to avoid acting on stale cached values from a previous session.
    useEffect(() => {
        if (isOffline) {
            return;
        }

        if (userWallet?.isLoading) {
            wasLoadingRef.current = true;
            return;
        }

        if (!wasLoadingRef.current) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isPendingOnfidoResult || hasFailedOnfido) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET, {forceReplace: true});
        }
    }, [isOffline, isPendingOnfidoResult, hasFailedOnfido, userWallet?.isLoading]);

    if (isEmptyObject(userWallet) || userWallet?.isLoading) {
        return <FullScreenLoadingIndicator />;
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
