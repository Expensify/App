import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, UserWallet} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AddBankAccount from './AddBankAccount/AddBankAccount';
import FailedKYC from './FailedKYC';
import FeesAndTerms from './FeesAndTerms/FeesAndTerms';
import PersonalInfo from './PersonalInfo/PersonalInfo';
import VerifyIdentity from './VerifyIdentity/VerifyIdentity';

type EnablePaymentsPageOnyxProps = {
    /** The user's wallet */
    userWallet: OnyxEntry<UserWallet>;

    /** The list of bank accounts */
    bankAccountList: OnyxEntry<BankAccountList>;
};

type EnablePaymentsPageProps = EnablePaymentsPageOnyxProps;

function EnablePaymentsPage({userWallet, bankAccountList}: EnablePaymentsPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

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
            <>
                <HeaderWithBackButton
                    title={translate('additionalDetailsStep.headerTitle')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                />
                <FailedKYC />
            </>
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

export default withOnyx<EnablePaymentsPageProps, EnablePaymentsPageOnyxProps>({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
    bankAccountList: {
        key: ONYXKEYS.BANK_ACCOUNT_LIST,
    },
})(EnablePaymentsPage);
