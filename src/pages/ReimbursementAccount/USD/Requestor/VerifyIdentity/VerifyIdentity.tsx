import React, {useCallback, useState} from 'react';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Onfido from '@components/Onfido';
import type {OnfidoData} from '@components/Onfido/types';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Growl from '@libs/Growl';
import {clearOnfidoToken, goToWithdrawalAccountSetupStep, updateReimbursementAccountDraft, verifyIdentityForBankAccount} from '@userActions/BankAccounts';
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

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [onfidoApplicantID] = useOnyx(ONYXKEYS.ONFIDO_APPLICANT_ID, {canBeMissing: false});
    const [onfidoToken] = useOnyx(ONYXKEYS.ONFIDO_TOKEN, {canBeMissing: false});
    const [onfidoKey, setOnfidoKey] = useState(() => Math.floor(Math.random() * 1000000));

    const policyID = reimbursementAccount?.achData?.policyID;
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID;

    const handleOnfidoSuccess = useCallback(
        (onfidoData: OnfidoData) => {
            if (!policyID) {
                return;
            }

            verifyIdentityForBankAccount(Number(bankAccountID), {...onfidoData, applicantID: onfidoApplicantID}, policyID);
            updateReimbursementAccountDraft({isOnfidoSetupComplete: true});
        },
        [bankAccountID, onfidoApplicantID, policyID],
    );

    const handleOnfidoError = () => {
        // In case of any unexpected error we log it to the server, show a growl, and return the user back to the requestor step so they can try again.
        Growl.error(translate('onfidoStep.genericError'), ONFIDO_ERROR_DISPLAY_DURATION);
        clearOnfidoToken();
        goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
    };

    const handleOnfidoUserExit = (isUserInitiated?: boolean) => {
        if (isUserInitiated) {
            clearOnfidoToken();
            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
        } else {
            setOnfidoKey(Math.floor(Math.random() * 1000000));
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID="VerifyIdentity"
            headerTitle={translate('onfidoStep.verifyIdentity')}
            handleBackButtonPress={onBackButtonPress}
            startStepIndex={3}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                <ScrollView contentContainerStyle={styles.flex1}>
                    <Onfido
                        key={onfidoKey}
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

export default VerifyIdentity;
