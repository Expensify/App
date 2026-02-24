import React from 'react';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/USD/utils/getValuesForBeneficialOwner';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ConfirmationUBOProps = SubStepProps & {beneficialOwnerBeingModifiedID: string};

const UBO_STEP_INDEXES = CONST.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.UBO;

function ConfirmationUBO({onNext, onMove, isEditing, beneficialOwnerBeingModifiedID}: ConfirmationUBOProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const values = getValuesForBeneficialOwner(beneficialOwnerBeingModifiedID, reimbursementAccountDraft);
    const error = reimbursementAccount ? ErrorUtils.getLatestErrorMessage(reimbursementAccount) : '';

    const summaryItems = [
        {
            description: translate('beneficialOwnerInfoStep.legalName'),
            title: `${values.firstName} ${values.lastName}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(UBO_STEP_INDEXES.LEGAL_NAME);
            },
        },
        {
            description: translate('common.dob'),
            title: values.dob,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(UBO_STEP_INDEXES.DATE_OF_BIRTH);
            },
        },
        {
            description: translate('beneficialOwnerInfoStep.last4SSN'),
            title: values.ssnLast4,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(UBO_STEP_INDEXES.SSN);
            },
        },
        {
            description: translate('beneficialOwnerInfoStep.address'),
            title: `${values.street}, ${values.city}, ${values.state} ${values.zipCode}`,
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(UBO_STEP_INDEXES.ADDRESS);
            },
        },
    ];

    return (
        <ConfirmationStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            pageTitle={translate('beneficialOwnerInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            showOnfidoLinks
            onfidoLinksTitle={`${translate('beneficialOwnerInfoStep.byAddingThisBankAccount')} `}
            error={error}
        />
    );
}

export default ConfirmationUBO;
