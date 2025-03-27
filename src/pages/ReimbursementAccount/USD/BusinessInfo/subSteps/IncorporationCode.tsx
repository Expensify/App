import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import IndustryCodeSelector from './IndustryCode/IndustryCodeSelector';

const COMPANY_INCORPORATION_CODE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_CODE;
const STEP_FIELDS = [COMPANY_INCORPORATION_CODE_KEY];

function IncorporationCode({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const defaultCompanyIncorporationCode = reimbursementAccount?.achData?.industryCode ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> = {};

        if (!values[COMPANY_INCORPORATION_CODE_KEY]) {
            errors[COMPANY_INCORPORATION_CODE_KEY] = translate('common.error.fieldRequired');
        } else if (!ValidationUtils.isValidIndustryCode(values[COMPANY_INCORPORATION_CODE_KEY])) {
            errors[COMPANY_INCORPORATION_CODE_KEY] = 'Please enter a valid industry classification code with six digits.';
        }

        return errors;
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh0, styles.flexGrow1]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{'What industry is the business classify as?'}</Text>
            <InputWrapper
                InputComponent={IndustryCodeSelector}
                inputID={COMPANY_INCORPORATION_CODE_KEY}
                defaultValue={defaultCompanyIncorporationCode}
                shouldSaveDraft={!isEditing}
            />
        </FormProvider>
    );
}

IncorporationCode.displayName = 'IncorporationCode';

export default IncorporationCode;
