import {subYears} from 'date-fns';
import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type DateOfBirthOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};

type DateOfBirthProps = DateOfBirthOnyxProps & SubStepProps;

const PERSONAL_INFO_DOB_KEY = INPUT_IDS.PERSONAL_INFO_STEP.DOB;
const STEP_FIELDS = [PERSONAL_INFO_DOB_KEY];

function DateOfBirth({reimbursementAccount, reimbursementAccountDraft, onNext, isEditing}: DateOfBirthProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.dob) {
                if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
                    errors.dob = translate('bankAccount.error.dob');
                } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
                    errors.dob = translate('bankAccount.error.age');
                }
            }

            return errors;
        },
        [translate],
    );

    const dobDefaultValue = reimbursementAccount?.achData?.[PERSONAL_INFO_DOB_KEY] ?? reimbursementAccountDraft?.[PERSONAL_INFO_DOB_KEY] ?? '';

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow2, styles.justifyContentBetween]}
            submitButtonStyles={[styles.mb0]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('personalInfoStep.enterYourDateOfBirth')}</Text>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={PERSONAL_INFO_DOB_KEY}
                label={translate('common.dob')}
                placeholder={translate('common.dateFormat')}
                defaultValue={dobDefaultValue}
                minDate={minDate}
                maxDate={maxDate}
                shouldSaveDraft={!isEditing}
            />
            <HelpLinks containerStyles={[styles.mt5]} />
        </FormProvider>
    );
}

DateOfBirth.displayName = 'DateOfBirth';

export default withOnyx<DateOfBirthProps, DateOfBirthOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(DateOfBirth);
