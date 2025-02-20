import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Onfido from '@components/Onfido';
import type {OnfidoData} from '@components/Onfido/types';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Growl from '@libs/Growl';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type VerifyIdentityProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

const ONFIDO_ERROR_DISPLAY_DURATION = 10000;

function VerifyIdentity({onBackButtonPress}: VerifyIdentityProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [onfidoApplicantID] = useOnyx(ONYXKEYS.ONFIDO_APPLICANT_ID);
    const [onfidoToken] = useOnyx(ONYXKEYS.ONFIDO_TOKEN);

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
        <InteractiveStepWrapper
            wrapperID={VerifyIdentity.displayName}
            headerTitle={translate('onfidoStep.verifyIdentity')}
            handleBackButtonPress={onBackButtonPress}
            startStepIndex={2}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
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
        </InteractiveStepWrapper>
    );
}

VerifyIdentity.displayName = 'VerifyIdentity';

export default VerifyIdentity;
