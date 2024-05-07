import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import Onfido from '@components/Onfido';
import type {OnfidoData} from '@components/Onfido/types';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Growl from '@libs/Growl';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalBankAccount, WalletOnfido} from '@src/types/onyx';

const DEFAULT_WALLET_ONFIDO_DATA = {
    loading: false,
    hasAcceptedPrivacyPolicy: false,
};

type VerifyIdentityOnyxProps = {
    /** Reimbursement account from ONYX */
    personalBankAccount: OnyxEntry<PersonalBankAccount>;

    /** Onfido applicant ID from ONYX */
    onfidoApplicantID: OnyxEntry<string>;

    /** The token required to initialize the Onfido SDK */
    onfidoToken: OnyxEntry<string>;

    /** The wallet onfido data */
    walletOnfidoData: OnyxEntry<WalletOnfido>;
};

type VerifyIdentityProps = VerifyIdentityOnyxProps;

const ONFIDO_ERROR_DISPLAY_DURATION = 10000;

function VerifyIdentity({personalBankAccount, onfidoApplicantID, onfidoToken, walletOnfidoData = DEFAULT_WALLET_ONFIDO_DATA}: VerifyIdentityProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleOnfidoSuccess = useCallback(
        (onfidoData: OnfidoData) => {
            BankAccounts.verifyIdentity({
                onfidoData: JSON.stringify({
                    ...onfidoData,
                    applicantID: walletOnfidoData?.applicantID,
                }),
            });
            BankAccounts.updateAddPersonalBankAccountDraft({isOnfidoSetupComplete: true});
        },
        [personalBankAccount, onfidoApplicantID],
    );

    const handleOnfidoError = () => {
        // In case of any unexpected error we log it to the server, show a growl, and return the user back to the requestor step so they can try again.
        Growl.error(translate('onfidoStep.genericError'), ONFIDO_ERROR_DISPLAY_DURATION);
        BankAccounts.clearOnfidoToken();
        // BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
    };

    const handleOnfidoUserExit = () => {
        BankAccounts.clearOnfidoToken();
        // BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
    };

    const handleBackButtonPress = () => {
        Wallet.updateCurrentStep(CONST.WALLET.STEP.ADDITIONAL_DETAILS);
    };

    return (
        <ScreenWrapper testID={VerifyIdentity.displayName}>
            <HeaderWithBackButton
                title={translate('onfidoStep.verifyIdentity')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={2}
                    stepNames={CONST.WALLET.STEP_NAMES}
                />
            </View>
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={styles.flex1}>
                    <Onfido
                        sdkToken={onfidoToken ?? ''}
                        onUserExit={handleOnfidoUserExit}
                        onError={handleOnfidoError}
                        onSuccess={handleOnfidoSuccess}
                    />
                </ScrollView>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

VerifyIdentity.displayName = 'VerifyIdentity';

export default withOnyx<VerifyIdentityProps, VerifyIdentityOnyxProps>({
    // @ts-expect-error: ONYXKEYS.PERSONAL_BANK_ACCOUNT is conflicting with ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM
    personalBankAccount: {
        key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
    },
    onfidoApplicantID: {
        key: ONYXKEYS.ONFIDO_APPLICANT_ID,
    },
    onfidoToken: {
        key: ONYXKEYS.ONFIDO_TOKEN,
    },
    walletOnfidoData: {
        key: ONYXKEYS.WALLET_ONFIDO,

        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(VerifyIdentity);
