import React, {useEffect, useMemo} from 'react';
import DocusignFullStep from '@components/SubStepForms/DocusignFullStep/Docusign';
import useOnyx from '@hooks/useOnyx';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {clearReimbursementAccountFinishCorpayBankAccountOnboarding, finishCorpayBankAccountOnboarding} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type DocusignProps = {
    onSubmit: () => void;
};

function Docusign({onSubmit}: DocusignProps) {
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
    }, [reimbursementAccount, onSubmit]);

    return <DocusignFullStep />;
}

Docusign.displayName = 'Docusign';

export default Docusign;
