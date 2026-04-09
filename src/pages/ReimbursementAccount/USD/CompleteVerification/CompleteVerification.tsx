import React, {useCallback, useMemo} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountSubmitCallback from '@hooks/useReimbursementAccountSubmitCallback';
import {getBankAccountIDAsNumber} from '@libs/ReimbursementAccountUtils';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {acceptACHContractForBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import ConfirmAgreements from './subSteps/ConfirmAgreements';

type CompleteVerificationProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press (URL-based navigation) */
    onSubmit?: () => void;
};

const COMPLETE_VERIFICATION_KEYS = INPUT_IDS.COMPLETE_VERIFICATION;

function CompleteVerification({onBackButtonPress, onSubmit}: CompleteVerificationProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);

    const values = useMemo(() => getSubStepValues(COMPLETE_VERIFICATION_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const policyID = reimbursementAccount?.achData?.policyID;
    const bankAccountID = getBankAccountIDAsNumber(reimbursementAccount?.achData);
    const markSubmitting = useReimbursementAccountSubmitCallback(onSubmit);

    const submit = useCallback(() => {
        acceptACHContractForBankAccount(
            bankAccountID,
            {
                isAuthorizedToUseBankAccount: values.isAuthorizedToUseBankAccount,
                certifyTrueInformation: values.certifyTrueInformation,
                acceptTermsAndConditions: values.acceptTermsAndConditions,
            },
            policyID,
            policyID ? lastPaymentMethod?.[policyID] : undefined,
        );
        markSubmitting();
    }, [bankAccountID, values.isAuthorizedToUseBankAccount, values.certifyTrueInformation, values.acceptTermsAndConditions, policyID, lastPaymentMethod, markSubmitting]);

    return (
        <InteractiveStepWrapper
            wrapperID="CompleteVerification"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('completeVerificationStep.completeVerification')}
            handleBackButtonPress={onBackButtonPress}
            startStepIndex={6}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <ConfirmAgreements onNext={submit} />
        </InteractiveStepWrapper>
    );
}

export default CompleteVerification;
