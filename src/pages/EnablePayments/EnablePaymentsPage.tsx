import React, {useEffect, useState} from 'react';
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
    const [isLoading, setIsLoading] = useState(true);
    const [prevWallet, setPrevWallet] = useState(userWallet);

    // Detect when Onyx delivers fresh data after the API call.
    // This is React's recommended pattern for adjusting state when a value changes.
    // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    if (isLoading && userWallet !== prevWallet) {
        setPrevWallet(userWallet);
        setIsLoading(false);
    }

    const {isPendingOnfidoResult, hasFailedOnfido} = isLoading ? {} : (userWallet ?? {});

    useEffect(() => {
        if (isOffline) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isPendingOnfidoResult || hasFailedOnfido) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET, {forceReplace: true});
            return;
        }

        openEnablePaymentsPage();
    }, [isOffline, isPendingOnfidoResult, hasFailedOnfido]);

    if (isLoading || isEmptyObject(userWallet)) {
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
