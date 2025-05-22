import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import getListOptionsFromCorpayPicklist from '@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type BusinessTypeProps = SubStepProps;

const {BUSINESS_CATEGORY, APPLICANT_TYPE_ID} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [BUSINESS_CATEGORY, APPLICANT_TYPE_ID];

function BusinessType({onNext, isEditing}: BusinessTypeProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {canBeMissing: false});

    const incorporationTypeListOptions = useMemo(() => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.ApplicantType), [corpayOnboardingFields]);
    const natureOfBusinessListOptions = useMemo(() => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.NatureOfBusiness), [corpayOnboardingFields]);

    const incorporationTypeDefaultValue = reimbursementAccount?.achData?.corpay?.[APPLICANT_TYPE_ID] ?? '';
    const businessCategoryDefaultValue = reimbursementAccount?.achData?.corpay?.[BUSINESS_CATEGORY] ?? '';

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        return getFieldRequiredErrors(values, STEP_FIELDS);
    }, []);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.mh5]}
            validate={validate}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{translate('businessInfoStep.whatTypeOfBusinessIsIt')}</Text>
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={incorporationTypeListOptions}
                description={translate('businessInfoStep.incorporationTypeName')}
                modalHeaderTitle={translate('businessInfoStep.selectIncorporationType')}
                searchInputTitle={translate('businessInfoStep.findIncorporationType')}
                inputID={APPLICANT_TYPE_ID}
                shouldSaveDraft={!isEditing}
                defaultValue={incorporationTypeDefaultValue}
            />
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={natureOfBusinessListOptions}
                description={translate('businessInfoStep.businessCategory')}
                modalHeaderTitle={translate('businessInfoStep.selectBusinessCategory')}
                searchInputTitle={translate('businessInfoStep.findBusinessCategory')}
                inputID={BUSINESS_CATEGORY}
                shouldSaveDraft={!isEditing}
                defaultValue={businessCategoryDefaultValue}
            />
        </FormProvider>
    );
}

BusinessType.displayName = 'BusinessType';

export default BusinessType;
