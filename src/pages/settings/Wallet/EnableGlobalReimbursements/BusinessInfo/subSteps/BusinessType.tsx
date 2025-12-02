import React, {useMemo} from 'react';
import PushRowFieldsStep from '@components/SubStepForms/PushRowFieldsStep';
import useEnableGlobalReimbursementsStepFormSubmit from '@hooks/useEnableGlobalReimbursementsStepFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getListOptionsFromCorpayPicklist from '@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

const {APPLICANT_TYPE_ID, BUSINESS_CATEGORY} = INPUT_IDS;
const STEP_FIELDS = [APPLICANT_TYPE_ID, BUSINESS_CATEGORY];

function BusinessType({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {canBeMissing: true});
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {canBeMissing: true});

    const incorporationTypeListOptions = useMemo(() => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.ApplicantType), [corpayOnboardingFields?.picklists.ApplicantType]);
    const natureOfBusinessListOptions = useMemo(
        () => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.NatureOfBusiness),
        [corpayOnboardingFields?.picklists.NatureOfBusiness],
    );

    const pushRowFields = useMemo(
        () => [
            {
                inputID: APPLICANT_TYPE_ID,
                defaultValue: enableGlobalReimbursementsDraft?.[APPLICANT_TYPE_ID] ?? '',
                options: incorporationTypeListOptions,
                description: translate('businessInfoStep.incorporationTypeName'),
                modalHeaderTitle: translate('businessInfoStep.selectIncorporationType'),
                searchInputTitle: translate('businessInfoStep.findIncorporationType'),
            },
            {
                inputID: BUSINESS_CATEGORY,
                defaultValue: enableGlobalReimbursementsDraft?.[BUSINESS_CATEGORY] ?? '',
                options: natureOfBusinessListOptions,
                description: translate('businessInfoStep.businessCategory'),
                modalHeaderTitle: translate('businessInfoStep.selectBusinessCategory'),
                searchInputTitle: translate('businessInfoStep.findBusinessCategory'),
            },
        ],
        [enableGlobalReimbursementsDraft, incorporationTypeListOptions, natureOfBusinessListOptions, translate],
    );

    const handleSubmit = useEnableGlobalReimbursementsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    if (corpayOnboardingFields === undefined) {
        return null;
    }

    return (
        <PushRowFieldsStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS}
            formTitle={translate('businessInfoStep.whatTypeOfBusinessIsIt')}
            onSubmit={handleSubmit}
            pushRowFields={pushRowFields}
        />
    );
}

BusinessType.displayName = 'BusinessType';

export default BusinessType;
