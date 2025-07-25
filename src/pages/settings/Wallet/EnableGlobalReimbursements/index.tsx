import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import Navigation from '@navigation/Navigation';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Agreements from './Agreements';
import Docusign from './Docusign';

function EnableGlobalReimbursements() {
    const [enableGlobalReimbursementsStep, setEnableGlobalReimbursementsStep] = useState<ValueOf<typeof CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP>>(
        CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS,
    );

    const handleNextEnableGlobalReimbursementsStep = () => {
        if (enableGlobalReimbursementsStep === CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS) {
            setEnableGlobalReimbursementsStep(CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.DOCUSIGN);
        } else {
            /* empty */
        }
    };

    const handleEnableGlobalReimbursementGoBack = () => {
        clearErrors(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
        switch (enableGlobalReimbursementsStep) {
            case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS:
                Navigation.goBack();
                break;
            case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.DOCUSIGN:
                setEnableGlobalReimbursementsStep(CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS);
                break;
            default:
                return null;
        }
    };

    switch (enableGlobalReimbursementsStep) {
        case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS:
            return (
                <Agreements
                    onSubmit={handleNextEnableGlobalReimbursementsStep}
                    onBackButtonPress={handleEnableGlobalReimbursementGoBack}
                />
            );
        case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.DOCUSIGN:
            return <Docusign onSubmit={handleNextEnableGlobalReimbursementsStep} />;
        default:
            return null;
    }
}

EnableGlobalReimbursements.displayName = 'EnableGlobalReimbursements';

export default EnableGlobalReimbursements;
