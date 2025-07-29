import React from 'react';
import AgreementsFullStep from '@components/SubStepForms/AgreementsFullStep';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

type AgreementsProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Currency of affiliated policy */
    policyCurrency: string;
};

const inputIDs = {
    provideTruthfulInformation: INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION,
    agreeToTermsAndConditions: INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS,
    consentToPrivacyNotice: INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE,
    authorizedToBindClientToAgreement: INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};

function Agreements({onBackButtonPress, onSubmit, policyCurrency}: AgreementsProps) {
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {canBeMissing: true});
    const defaultValues: Record<keyof typeof inputIDs, boolean> = Object.fromEntries(
        Object.keys(inputIDs).map((key) => {
            const typedKey = key as keyof typeof inputIDs;
            return [typedKey, enableGlobalReimbursementsDraft?.[typedKey] ?? false];
        }),
    ) as Record<keyof typeof inputIDs, boolean>;

    return (
        <AgreementsFullStep
            defaultValues={defaultValues}
            formID={ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS}
            inputIDs={inputIDs}
            onBackButtonPress={onBackButtonPress}
            onSubmit={onSubmit}
            policyCurrency={policyCurrency}
            startStepIndex={0}
            stepNames={CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP_NAMES}
        />
    );
}

Agreements.displayName = 'Agreements';

export default Agreements;
