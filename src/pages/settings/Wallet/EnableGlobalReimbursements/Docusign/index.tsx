import React from 'react';
import DocusignFullStep from '@components/SubStepForms/DocusignFullStep';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

type DocusignProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Currency of affiliated policy */
    policyCurrency: string;
};

function Docusign({onBackButtonPress, onSubmit, policyCurrency}: DocusignProps) {
    const [enableGlobalReimbursements] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS, {canBeMissing: true});
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {canBeMissing: true});
    const defaultValue = enableGlobalReimbursementsDraft?.[INPUT_IDS.ACH_AUTHORIZATION_FORM] ?? [];

    return (
        <DocusignFullStep
            defaultValue={defaultValue}
            formID={ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS}
            inputID={INPUT_IDS.ACH_AUTHORIZATION_FORM}
            isLoading={enableGlobalReimbursements?.isEnablingGlobalReimbursements ?? false}
            onBackButtonPress={onBackButtonPress}
            onSubmit={onSubmit}
            policyCurrency={policyCurrency}
            startStepIndex={1}
            stepNames={CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP_NAMES}
        />
    );
}

Docusign.displayName = 'Docusign';

export default Docusign;
