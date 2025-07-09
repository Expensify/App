import type {ComponentType} from 'react';
import React, {useEffect, useMemo} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {clearReimbursementAccountFinishCorpayBankAccountOnboarding, finishCorpayBankAccountOnboarding} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import UploadPowerform from './subSteps/UploadPowerform';

type DocusignProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** ID of current policy */
    policyID: string | undefined;

    /** Array of step names */
    stepNames?: readonly string[];
};

type DocusignStepProps = {
    /** ID of current policy */
    policyID: string | undefined;
} & SubStepProps;

const bodyContent: Array<ComponentType<DocusignStepProps>> = [UploadPowerform];

const INPUT_KEYS = {
    PROVIDE_TRUTHFUL_INFORMATION: INPUT_IDS.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION,
    AGREE_TO_TERMS_AND_CONDITIONS: INPUT_IDS.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS,
    CONSENT_TO_PRIVACY_NOTICE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE,
    AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT: INPUT_IDS.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
    ACH_AUTHORIZATION_FORM: INPUT_IDS.ADDITIONAL_DATA.CORPAY.ACH_AUTHORIZATION_FORM,
};

function Docusign({onBackButtonPress, onSubmit, policyID, stepNames}: DocusignProps) {
    const {translate} = useLocalize();

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

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<DocusignStepProps>({bodyContent, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
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
            wrapperID={Docusign.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('docusignStep.subheader')}
            stepNames={stepNames}
            startStepIndex={6}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                policyID={policyID}
            />
        </InteractiveStepWrapper>
    );
}

Docusign.displayName = 'Docusign';

export default Docusign;
