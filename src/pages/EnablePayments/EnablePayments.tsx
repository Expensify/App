import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {hasExpensifyPaymentMethod} from '@libs/PaymentUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {openEnablePaymentsPage} from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AddBankAccount from './AddBankAccount/AddBankAccount';
import FailedKYC from './FailedKYC';
import FeesAndTerms from './FeesAndTerms/FeesAndTerms';
import PersonalInfo from './PersonalInfo/PersonalInfo';
import VerifyIdentity from './VerifyIdentity/VerifyIdentity';

function EnablePaymentsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const paymentCardList = fundList ?? {};

    const wasLoadingRef = useRef(false);
    const [hasFreshData, setHasFreshData] = useState(false);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        openEnablePaymentsPage();
    }, [isOffline]);

    // Only render step content after the fresh data loading cycle (isLoading: true → false) completes,
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

        // eslint-disable-next-line react-hooks/set-state-in-effect -- we need to trigger a re-render when fresh data arrives to stop showing the loading indicator
        setHasFreshData(true);
    }, [isOffline, userWallet?.isLoading]);

    const isUserWalletEmpty = isEmptyObject(userWallet);
    if (isUserWalletEmpty || userWallet?.isLoading || (!hasFreshData && !isOffline)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'EnablePaymentsPage',
            isUserWalletEmpty,
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    if (userWallet?.errorCode === CONST.WALLET.ERROR.KYC) {
        return (
            <ScreenWrapper
                testID="EnablePaymentsPage"
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <HeaderWithBackButton
                    title={translate('personalInfoStep.personalInfo')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                />
                <FailedKYC />
            </ScreenWrapper>
        );
    }
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const enablePaymentsStep = !hasExpensifyPaymentMethod(paymentCardList, bankAccountList ?? {}, hasActivatedWallet)
        ? CONST.WALLET.STEP.ADD_BANK_ACCOUNT
        : userWallet?.currentStep || CONST.WALLET.STEP.ADDITIONAL_DETAILS;

    let CurrentStep: React.JSX.Element | null;
    switch (enablePaymentsStep) {
        case CONST.WALLET.STEP.ADD_BANK_ACCOUNT:
            CurrentStep = <AddBankAccount />;
            break;
        case CONST.WALLET.STEP.ADDITIONAL_DETAILS:
        case CONST.WALLET.STEP.ADDITIONAL_DETAILS_KBA:
            CurrentStep = <PersonalInfo />;
            break;
        case CONST.WALLET.STEP.ONFIDO:
            CurrentStep = <VerifyIdentity />;
            break;
        case CONST.WALLET.STEP.TERMS:
            CurrentStep = <FeesAndTerms />;
            break;
        default:
            CurrentStep = null;
            break;
    }

    if (CurrentStep) {
        return <View style={styles.flex1}>{CurrentStep}</View>;
    }

    return null;
}

export default EnablePaymentsPage;
