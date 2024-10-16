import {subYears} from 'date-fns';
import React, {useCallback} from 'react';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

type DateOfBirthStepProps = SubStepProps & {
    /** The ID of the form */
    formID: keyof OnyxFormValuesMapping;

    /** The title of the form */
    formTitle: string;

    /** The validation function to call when the form is submitted */
    customValidate?: (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => Partial<Record<never, string | undefined>>;

    /** A function to call when the form is submitted */
    onSubmit: (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => void;

    /** Fields list of the form */
    stepFields: Array<FormOnyxKeys<keyof OnyxFormValuesMapping>>;

    /** The ID of the date of birth input */
    dobInputID: keyof FormOnyxValues;

    /** The default value for the date of birth input */
    dobDefaultValue: string;
};

function DateOfBirthStep({formID, formTitle, customValidate, onSubmit, stepFields, dobInputID, dobDefaultValue, isEditing}: DateOfBirthStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    const validate = useCallback(
        (values: FormOnyxValues<typeof formID>): Partial<Record<never, string | undefined>> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, stepFields);

            if (values[dobInputID]) {
                if (!ValidationUtils.isValidPastDate(values[dobInputID]) || !ValidationUtils.meetsMaximumAgeRequirement(values[dobInputID])) {
                    // @ts-expect-error type mismatch to be fixed
                    errors[dobInputID] = translate('bankAccount.error.dob');
                } else if (!ValidationUtils.meetsMinimumAgeRequirement(values[dobInputID])) {
                    // @ts-expect-error type mismatch to be fixed
                    errors[dobInputID] = translate('bankAccount.error.age');
                }
            }

            return errors;
        },
        [dobInputID, stepFields, translate],
    );

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={customValidate ?? validate}
            onSubmit={onSubmit}
            style={[styles.mh5, styles.flexGrow2, styles.justifyContentBetween]}
            submitButtonStyles={[styles.mb0]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{formTitle}</Text>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={dobInputID}
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

DateOfBirthStep.defaultName = 'DateOfBirthStep';

export default DateOfBirthStep;
