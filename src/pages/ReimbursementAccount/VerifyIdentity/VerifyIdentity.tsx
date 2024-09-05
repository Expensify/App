import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
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
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type VerifyIdentityOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** Onfido applicant ID from ONYX */
    onfidoApplicantID: OnyxEntry<string>;

    /** The token required to initialize the Onfido SDK */
    onfidoToken: OnyxEntry<string>;
};

type VerifyIdentityProps = VerifyIdentityOnyxProps & {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

const ONFIDO_ERROR_DISPLAY_DURATION = 10000;

function VerifyIdentity({reimbursementAccount, onBackButtonPress, onfidoApplicantID, onfidoToken}: VerifyIdentityProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = reimbursementAccount?.achData?.policyID ?? '-1';
    const handleOnfidoSuccess = useCallback(
        (onfidoData: OnfidoData) => {
            BankAccounts.verifyIdentityForBankAccount(Number(reimbursementAccount?.achData?.bankAccountID ?? '-1'), {...onfidoData, applicantID: onfidoApplicantID}, policyID);
            BankAccounts.updateReimbursementAccountDraft({isOnfidoSetupComplete: true});
        },
        [reimbursementAccount, onfidoApplicantID, policyID],
    );

    const handleOnfidoError = () => {
        // In case of any unexpected error we log it to the server, show a growl, and return the user back to the requestor step so they can try again.
        Growl.error(translate('onfidoStep.genericError'), ONFIDO_ERROR_DISPLAY_DURATION);
        BankAccounts.clearOnfidoToken();
        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
    };

    const handleOnfidoUserExit = () => {
        BankAccounts.clearOnfidoToken();
        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
    };

    return (
        <ScreenWrapper testID={VerifyIdentity.displayName}>
            <HeaderWithBackButton
                title={translate('onfidoStep.verifyIdentity')}
                onBackButtonPress={onBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={2}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
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

export default function VerifyIdentityOnyx(props: Omit<VerifyIdentityProps, keyof VerifyIdentityOnyxProps>) {
    const [reimbursementAccount, reimbursementAccountMetadata] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [onfidoApplicantID, onfidoApplicantIDMetadata] = useOnyx(ONYXKEYS.ONFIDO_APPLICANT_ID);
    const [onfidoToken, onfidoTokenMetadata] = useOnyx(ONYXKEYS.ONFIDO_TOKEN);

    if (isLoadingOnyxValue(reimbursementAccountMetadata, onfidoApplicantIDMetadata, onfidoTokenMetadata)) {
        return null;
    }

    return (
        <VerifyIdentity
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            reimbursementAccount={reimbursementAccount}
            onfidoApplicantID={onfidoApplicantID}
            onfidoToken={onfidoToken}
        />
    );
}
