import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import * as Wallet from '@userActions/Wallet';
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
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        if (isEmptyObject(userWallet)) {
            Wallet.openEnablePaymentsPage();
        }
    }, [isOffline, userWallet]);

    if (isEmptyObject(userWallet)) {
        return <FullScreenLoadingIndicator />;
    }

    if (userWallet?.errorCode === CONST.WALLET.ERROR.KYC) {
        return (
            <ScreenWrapper
                testID={EnablePaymentsPage.displayName}
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

    const currentStep = isEmptyObject(bankAccountList) ? CONST.WALLET.STEP.ADD_BANK_ACCOUNT : userWallet?.currentStep || CONST.WALLET.STEP.ADDITIONAL_DETAILS;

    switch (currentStep) {
        case CONST.WALLET.STEP.ADD_BANK_ACCOUNT:
            return <AddBankAccount />;
        case CONST.WALLET.STEP.ADDITIONAL_DETAILS:
        case CONST.WALLET.STEP.ADDITIONAL_DETAILS_KBA:
            return <PersonalInfo />;
        case CONST.WALLET.STEP.ONFIDO:
            return <VerifyIdentity />;
        case CONST.WALLET.STEP.TERMS:
            return <FeesAndTerms />;
        default:
            return null;
    }
}

EnablePaymentsPage.displayName = 'EnablePaymentsPage';

export default EnablePaymentsPage;
