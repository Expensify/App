import {subYears} from 'date-fns';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.DATE_OF_BIRTH];

function DateOfBirthStep({isEditing, onNext, privatePersonalDetails}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE);

    const handleSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.DATE_OF_BIRTH])) {
                errors[INPUT_IDS.DATE_OF_BIRTH] = translate('common.error.fieldRequired');
            } else if (!ValidationUtils.isValidPastDate(values[INPUT_IDS.DATE_OF_BIRTH]) || !ValidationUtils.meetsMaximumAgeRequirement(values[INPUT_IDS.DATE_OF_BIRTH])) {
                errors[INPUT_IDS.DATE_OF_BIRTH] = translate('bankAccount.error.dob');
            }
            return errors;
        },
        [translate],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
        >
            <View style={styles.ph5}>
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
