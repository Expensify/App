import React, {useEffect, useMemo} from 'react';
import DocusignFullStep from '@components/SubStepForms/DocusignFullStep';
import useOnyx from '@hooks/useOnyx';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {clearReimbursementAccountFinishCorpayBankAccountOnboarding, finishCorpayBankAccountOnboarding} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type DocusignProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Array of step names */
    stepNames?: readonly string[];

    /** Currency of the policy */
    policyCurrency: string;
};

const INPUT_KEYS = {
    PROVIDE_TRUTHFUL_INFORMATION: INPUT_IDS.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION,
    AGREE_TO_TERMS_AND_CONDITIONS: INPUT_IDS.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS,
    CONSENT_TO_PRIVACY_NOTICE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE,
    AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT: INPUT_IDS.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
    ACH_AUTHORIZATION_FORM: INPUT_IDS.ADDITIONAL_DATA.CORPAY.ACH_AUTHORIZATION_FORM,
};

function Docusign({onBackButtonPress, onSubmit, stepNames, policyCurrency}: DocusignProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});
    const finalStepValues = useMemo(() => getSubStepValues(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const submit = () => {
        finishCorpayBankAccountOnboarding({
            inputs: JSON.stringify({
                provideTruthfulInformation: finalStepValues.provideTruthfulInformation,
                agreeToTermsAndConditions: finalStepValues.agreeToTermsAndConditions,
                consentToPrivacyNotice: finalStepValues.consentToPrivacyNotice,
                authorizedToBindClientToAgreement: finalStepValues.authorizedToBindClientToAgreement,
            }),
            achAuthorizationForm: finalStepValues.achAuthorizationForm.at(0),
            bankAccountID,
        });
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isFinishingCorpayBankAccountOnboarding || !reimbursementAccount?.isSuccess) {
            return;
        }

        if (reimbursementAccount?.isSuccess) {
            onSubmit();
            clearReimbursementAccountFinishCorpayBankAccountOnboarding();
        }

        return () => {
            clearReimbursementAccountFinishCorpayBankAccountOnboarding();
        };
    }, [reimbursementAccount?.errors, reimbursementAccount?.isFinishingCorpayBankAccountOnboarding, reimbursementAccount?.isSuccess, onSubmit]);

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        onBackButtonPress();
    };

    return (
        <DocusignFullStep
            defaultValue={finalStepValues.achAuthorizationForm}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            inputID={INPUT_KEYS.ACH_AUTHORIZATION_FORM}
            isLoading={reimbursementAccount?.isFinishingCorpayBankAccountOnboarding ?? false}
            onBackButtonPress={handleBackButtonPress}
            onSubmit={submit}
            currency={policyCurrency}
            startStepIndex={6}
            stepNames={stepNames}
        />
    );
}

export default Docusign;
