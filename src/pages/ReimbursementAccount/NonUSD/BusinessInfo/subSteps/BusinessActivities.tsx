/** Collects all nine required AU business activity declarations on one form. */
import PushRowFieldsStep from '@components/SubStepForms/PushRowFieldsStep';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';

import {BUSINESS_ACTIVITY_FIELDS} from '@pages/ReimbursementAccount/NonUSD/utils/getBusinessActivityAnswers';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

function BusinessActivities({onNext, onMove, isEditing}: SubPageProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const options = {true: translate('common.yes'), false: translate('common.no')};
    const searchInputTitle = translate('common.search');
    const pushRowFields = BUSINESS_ACTIVITY_FIELDS.map(({inputID, label, sentryLabel}) => ({
        inputID,
        sentryLabel,
        defaultValue: String(reimbursementAccountDraft?.[inputID] ?? reimbursementAccount?.achData?.corpay?.[inputID] ?? ''),
        options,
        description: translate(label),
        modalHeaderTitle: translate(label),
        searchInputTitle,
    }));

    const submit = useReimbursementAccountStepFormSubmit({
        fieldIds: BUSINESS_ACTIVITY_FIELDS.map(({inputID}) => inputID),
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <PushRowFieldsStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.businessActivities')}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.continue')}
            onSubmit={submit}
            pushRowFields={pushRowFields}
        />
    );
}

export default BusinessActivities;
