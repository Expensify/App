import {subYears} from 'date-fns';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsStepFormSubmit from '@hooks/usePersonalDetailsStepFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.DATE_OF_BIRTH];

function DateOfBirthStep({privatePersonalDetails, isEditing, onNext}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.DATE_OF_BIRTH])) {
                errors[INPUT_IDS.DATE_OF_BIRTH] = translate('common.error.fieldRequired');
            } else if (!ValidationUtils.isValidPastDate(values[INPUT_IDS.DATE_OF_BIRTH]) || !ValidationUtils.meetsMaximumAgeRequirement(values[INPUT_IDS.DATE_OF_BIRTH])) {
                errors[INPUT_IDS.DATE_OF_BIRTH] = translate('bankAccount.error.dob');
            }
            return errors;
        },
        [translate],
    );

    const submitPersonalDetails = usePersonalDetailsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    const handleSubmit = (values: FormOnyxValues<'personalDetailsForm'>) => {
        // in case the dob is taken from existing personal details object, we need to force apply its values to the draft object
        FormActions.setFormValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM, values);
        submitPersonalDetails(values);
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('privatePersonalDetails.enterDateOfBirth')}</Text>
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={INPUT_IDS.DATE_OF_BIRTH}
                    label={translate('common.dob')}
                    placeholder={translate('common.dateFormat')}
                    defaultValue={privatePersonalDetails?.dob}
                    minDate={minDate}
                    maxDate={maxDate}
                    shouldSaveDraft={!isEditing}
                />
            </View>
        </FormProvider>
    );
}

DateOfBirthStep.displayName = 'DateOfBirthStep';

export default DateOfBirthStep;
