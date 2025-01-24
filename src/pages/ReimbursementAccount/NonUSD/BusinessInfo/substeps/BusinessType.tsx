import React, {useCallback} from 'react';
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
import * as ValidationUtils from '@libs/ValidationUtils';
import {applicantType, natureOfBusiness} from '@pages/ReimbursementAccount/NonUSD/BusinessInfo/mockedCorpayLists';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type BusinessTypeProps = SubStepProps;

const {BUSINESS_CATEGORY, APPLICANT_TYPE_ID} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [BUSINESS_CATEGORY, APPLICANT_TYPE_ID];

const INCORPORATION_TYPE_LIST_OPTIONS = applicantType.reduce((accumulator, currentValue) => {
    accumulator[currentValue.name] = currentValue.stringValue;
    return accumulator;
}, {} as Record<string, string>);
const BUSINESS_CATEGORY_LIST_OPTIONS = natureOfBusiness.reduce((accumulator, currentValue) => {
    accumulator[currentValue.name] = currentValue.stringValue;
    return accumulator;
}, {} as Record<string, string>);

function BusinessType({onNext, isEditing}: BusinessTypeProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const incorporationTypeDefaultValue = reimbursementAccount?.achData?.additionalData?.corpay?.[APPLICANT_TYPE_ID] ?? reimbursementAccountDraft?.[APPLICANT_TYPE_ID] ?? '';
    const businessCategoryDefaultValue = reimbursementAccount?.achData?.additionalData?.corpay?.[BUSINESS_CATEGORY] ?? reimbursementAccountDraft?.[BUSINESS_CATEGORY] ?? '';

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        return ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
    }, []);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
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
                optionsList={INCORPORATION_TYPE_LIST_OPTIONS}
                description={translate('businessInfoStep.incorporationTypeName')}
                modalHeaderTitle={translate('businessInfoStep.selectIncorporationType')}
                searchInputTitle={translate('businessInfoStep.findIncorporationType')}
                inputID={APPLICANT_TYPE_ID}
                shouldSaveDraft={!isEditing}
                value={incorporationTypeDefaultValue}
            />
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={BUSINESS_CATEGORY_LIST_OPTIONS}
                description={translate('businessInfoStep.businessCategory')}
                modalHeaderTitle={translate('businessInfoStep.selectBusinessCategory')}
                searchInputTitle={translate('businessInfoStep.findBusinessCategory')}
                inputID={BUSINESS_CATEGORY}
                shouldSaveDraft={!isEditing}
                value={businessCategoryDefaultValue}
            />
        </FormProvider>
    );
}

BusinessType.displayName = 'BusinessType';

export default BusinessType;
