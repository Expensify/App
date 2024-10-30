
import {subYears} from 'date-fns';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import WhyLink from '@pages/ReimbursementAccount/NonUSD/WhyLink';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type DateOfBirthProps = SubStepProps & {isSecondSigner: boolean};

const {SIGNER_DATE_OF_BIRTH, SECOND_SIGNER_DATE_OF_BIRTH} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function DateOfBirth({onNext, isEditing, isSecondSigner}: DateOfBirthProps) {
    const inputID = isSecondSigner ? SECOND_SIGNER_DATE_OF_BIRTH : SIGNER_DATE_OF_BIRTH;
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const defaultValue = reimbursementAccount?.achData?.additionalData?.corpay?.[inputID] ?? reimbursementAccountDraft?.[inputID] ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            return ValidationUtils.getFieldRequiredErrors(values, [inputID]);
        },
        [inputID],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [inputID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('signerInfoStep.whatsYourDOB')}</Text>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={inputID}
                label={translate('common.dob')}
                containerStyles={[styles.mt6]}
                placeholder={translate('common.dateFormat')}
                minDate={minDate}
                maxDate={maxDate}
                defaultValue={defaultValue}
                shouldSaveDraft={!isEditing}
            />
            <WhyLink containerStyles={[styles.mt6, styles.mh5]} />
        </FormProvider>
    );
}

DateOfBirth.displayName = 'DateOfBirth';

export default DateOfBirth;
