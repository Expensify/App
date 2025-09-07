import React, {useMemo} from 'react';
import PushRowFieldsStep from '@components/SubStepForms/PushRowFieldsStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getListOptionsFromCorpayPicklist from '@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type BusinessTypeProps = SubStepProps;

const {BUSINESS_CATEGORY, APPLICANT_TYPE_ID} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [BUSINESS_CATEGORY, APPLICANT_TYPE_ID];

function BusinessType({onNext, isEditing, onMove}: BusinessTypeProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {canBeMissing: false});

    const incorporationTypeListOptions = useMemo(() => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.ApplicantType), [corpayOnboardingFields]);
    const natureOfBusinessListOptions = useMemo(() => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.NatureOfBusiness), [corpayOnboardingFields]);

    const incorporationTypeDefaultValue = reimbursementAccount?.achData?.corpay?.[APPLICANT_TYPE_ID] ?? '';
    const businessCategoryDefaultValue = reimbursementAccount?.achData?.corpay?.[BUSINESS_CATEGORY] ?? '';

    const pushRowFields = useMemo(
        () => [
            {
                inputID: APPLICANT_TYPE_ID,
                defaultValue: incorporationTypeDefaultValue,
                options: incorporationTypeListOptions,
                description: translate('businessInfoStep.incorporationTypeName'),
                modalHeaderTitle: translate('businessInfoStep.selectIncorporationType'),
                searchInputTitle: translate('businessInfoStep.findIncorporationType'),
            },
            {
                inputID: BUSINESS_CATEGORY,
                defaultValue: businessCategoryDefaultValue,
                options: natureOfBusinessListOptions,
                description: translate('businessInfoStep.businessCategory'),
                modalHeaderTitle: translate('businessInfoStep.selectBusinessCategory'),
                searchInputTitle: translate('businessInfoStep.findBusinessCategory'),
            },
        ],
        [businessCategoryDefaultValue, incorporationTypeDefaultValue, incorporationTypeListOptions, natureOfBusinessListOptions, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
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
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.whatTypeOfBusinessIsIt')}
            onSubmit={handleSubmit}
            pushRowFields={pushRowFields}
        />
    );
}

BusinessType.displayName = 'BusinessType';

export default BusinessType;
