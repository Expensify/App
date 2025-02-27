import type {ComponentType} from 'react';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import ConfirmAgreements from './substeps/ConfirmAgreements';

type CompleteVerificationProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;
};

const COMPLETE_VERIFICATION_KEYS = INPUT_IDS.COMPLETE_VERIFICATION;
const bodyContent: Array<ComponentType<SubStepProps>> = [ConfirmAgreements];

function CompleteVerification({onBackButtonPress}: CompleteVerificationProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const values = useMemo(() => getSubstepValues(COMPLETE_VERIFICATION_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const policyID = reimbursementAccount?.achData?.policyID ?? '-1';

    const submit = useCallback(() => {
        BankAccounts.acceptACHContractForBankAccount(
            Number(reimbursementAccount?.achData?.bankAccountID ?? '-1'),
            {
                isAuthorizedToUseBankAccount: values.isAuthorizedToUseBankAccount,
                certifyTrueInformation: values.certifyTrueInformation,
                acceptTermsAndConditions: values.acceptTermsAndConditions,
            },
            policyID,
        );
    }, [reimbursementAccount, values, policyID]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo, goToTheLastStep} = useSubStep({bodyContent, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (screenIndex === 0) {
            onBackButtonPress();
        } else {
            prevScreen();
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID={CompleteVerification.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('completeVerificationStep.completeVerification')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={5}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

CompleteVerification.displayName = 'CompleteVerification';

export default CompleteVerification;
