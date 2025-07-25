import React from 'react';
import AgreementsFullStep from '@components/SubStepForms/AgreementsFullStep';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

type AgreementsProps = {
    onSubmit: () => void;
    onBackButtonPress: () => void;
};

const inputIDs = {
    provideTruthfulInformation: INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION,
    agreeToTermsAndConditions: INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS,
    consentToPrivacyNotice: INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE,
    authorizedToBindClientToAgreement: INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};

function Agreements({onSubmit, onBackButtonPress}: AgreementsProps) {
    return (
        <AgreementsFullStep
            stepNames={CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP_NAMES}
            formID={ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS}
            onSubmit={onSubmit}
            inputIDs={inputIDs}
            onBackButtonPress={onBackButtonPress}
            policyCurrency="USD"
            startStepIndex={0}
        />
    );
}

Agreements.displayName = 'Agreements';

export default Agreements;
