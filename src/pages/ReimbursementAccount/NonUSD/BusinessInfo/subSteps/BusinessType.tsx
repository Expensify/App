import React, {useMemo} from 'react';
import PushRowFieldsStep from '@components/SubStepForms/PushRowFieldsStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getListOptionsFromCorpayPicklist from '@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type BusinessTypeProps = SubStepProps;

const {COUNTRY} = INPUT_IDS.ADDITIONAL_DATA;
const {BUSINESS_CATEGORY, APPLICANT_TYPE_ID, BUSINESS_TYPE_ID} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS_WITHOUT_BUSINESS_TYPE = [BUSINESS_CATEGORY, APPLICANT_TYPE_ID];
const STEP_FIELDS = [BUSINESS_CATEGORY, APPLICANT_TYPE_ID, BUSINESS_TYPE_ID];

function BusinessType({onNext, isEditing, onMove}: BusinessTypeProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {canBeMissing: false});
    const country = reimbursementAccountDraft?.[COUNTRY] ?? reimbursementAccount?.achData?.[COUNTRY] ?? '';
    const isBusinessTypeRequired = country !== CONST.COUNTRY.CA;

    const incorporationTypeListOptions = useMemo(() => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.ApplicantType), [corpayOnboardingFields?.picklists.ApplicantType]);
    const natureOfBusinessListOptions = useMemo(
        () => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.NatureOfBusiness),
        [corpayOnboardingFields?.picklists.NatureOfBusiness],
    );
    const businessTypeListOptions = useMemo(() => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.BusinessType), [corpayOnboardingFields?.picklists.BusinessType]);

    const incorporationTypeDefaultValue = reimbursementAccount?.achData?.corpay?.[APPLICANT_TYPE_ID] ?? '';
    const businessCategoryDefaultValue = reimbursementAccount?.achData?.corpay?.[BUSINESS_CATEGORY] ?? '';
    const businessTypeDefaultValue = reimbursementAccount?.achData?.corpay?.[BUSINESS_TYPE_ID] ?? '';

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
            ...(isBusinessTypeRequired
                ? [
                      {
                          inputID: BUSINESS_TYPE_ID,
                          defaultValue: businessTypeDefaultValue,
                          options: businessTypeListOptions,
                          description: translate('businessInfoStep.businessType'),
                          modalHeaderTitle: translate('businessInfoStep.selectBusinessType'),
                          searchInputTitle: translate('businessInfoStep.findBusinessType'),
                      },
                  ]
                : []),
        ],
        [
            businessCategoryDefaultValue,
            businessTypeDefaultValue,
            businessTypeListOptions,
            incorporationTypeDefaultValue,
            incorporationTypeListOptions,
            isBusinessTypeRequired,
            natureOfBusinessListOptions,
            translate,
        ],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: isBusinessTypeRequired ? STEP_FIELDS : STEP_FIELDS_WITHOUT_BUSINESS_TYPE,
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
