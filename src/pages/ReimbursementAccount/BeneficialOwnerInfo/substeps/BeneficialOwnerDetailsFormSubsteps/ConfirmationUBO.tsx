import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import getValuesForBeneficialOwner from '@pages/ReimbursementAccount/utils/getValuesForBeneficialOwner';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {ReimbursementAccount} from '@src/types/onyx';

type ConfirmationUBOOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};
type ConfirmationUBOProps = SubStepProps & ConfirmationUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};

const UBO_STEP_INDEXES = CONST.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.UBO;

function ConfirmationUBO({reimbursementAccount, reimbursementAccountDraft, onNext, onMove, isEditing, beneficialOwnerBeingModifiedID}: ConfirmationUBOProps) {
    const {translate} = useLocalize();

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

ConfirmationUBO.displayName = 'ConfirmationUBO';

export default withOnyx<ConfirmationUBOProps, ConfirmationUBOOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(ConfirmationUBO);
