import React, {useEffect, useMemo} from 'react';
import AgreementsFullStep from '@components/SubStepForms/AgreementsFullStep';
import useOnyx from '@hooks/useOnyx';
import requiresDocusignStep from '@pages/ReimbursementAccount/NonUSD/utils/requiresDocusignStep';
import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {clearReimbursementAccountFinishCorpayBankAccountOnboarding, finishCorpayBankAccountOnboarding} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const INPUT_KEYS = {
    provideTruthfulInformation: INPUT_IDS.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION,
    agreeToTermsAndConditions: INPUT_IDS.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS,
    consentToPrivacyNotice: INPUT_IDS.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE,
    authorizedToBindClientToAgreement: INPUT_IDS.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};

function Agreements({onBackButtonPress, onSubmit, stepNames, currency}: NonUSDPageProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const agreementsStepValues = useMemo(() => getSubStepValues(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const isDocusignStepRequired = requiresDocusignStep(currency);

    const submit = () => {
        if (isDocusignStepRequired) {
            onSubmit();
            return;
        }

        finishCorpayBankAccountOnboarding({
            inputs: JSON.stringify({
                provideTruthfulInformation: agreementsStepValues.provideTruthfulInformation,
                agreeToTermsAndConditions: agreementsStepValues.agreeToTermsAndConditions,
                consentToPrivacyNotice: agreementsStepValues.consentToPrivacyNotice,
                authorizedToBindClientToAgreement: agreementsStepValues.authorizedToBindClientToAgreement,
            }),
            bankAccountID,
        });
    };

    useEffect(() => {
        if (isDocusignStepRequired) {
            return;
        }

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
    }, [reimbursementAccount?.errors, reimbursementAccount?.isFinishingCorpayBankAccountOnboarding, reimbursementAccount?.isSuccess, onSubmit, currency, isDocusignStepRequired]);

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        onBackButtonPress();
    };

    return (
        <AgreementsFullStep
            defaultValues={agreementsStepValues}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            inputIDs={INPUT_KEYS}
            isLoading={reimbursementAccount?.isFinishingCorpayBankAccountOnboarding ?? false}
            onBackButtonPress={handleBackButtonPress}
            onSubmit={submit}
            currency={currency ?? ''}
            startStepIndex={5}
            stepNames={stepNames}
        />
    );
}

export default Agreements;
