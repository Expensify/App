import React, {useCallback} from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type EditReportFieldDatePageProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Name of the policy report field */
    fieldName: string;

    /** Key of the policy report field */
    fieldKey: string;

    /** Flag to indicate if the field can be left blank */
    isRequired: boolean;

    /** Callback to fire when the Save button is pressed  */
    onSubmit: (form: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM>) => void;
};

function EditReportFieldDatePage({fieldName, isRequired, onSubmit, fieldValue, fieldKey}: EditReportFieldDatePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = useCallback(
        (value: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM> = {};
            if (isRequired && value[fieldKey].trim() === '') {
                errors[fieldKey] = translate('common.error.fieldRequired');
            }
            return errors;
        },
        [fieldKey, isRequired, translate],
    );

    return (
        <FormProvider
            style={[styles.flexGrow1, styles.ph5]}
            formID={ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM}
            onSubmit={onSubmit}
            validate={validate}
            submitButtonText={translate('common.save')}
            enabledWhenOffline
            shouldHideFixErrorsAlert
        >
            <View style={styles.mb4}>
                <InputWrapper
                    InputComponent={DatePicker}
                    inputID={fieldKey}
                    name={fieldKey}
                    defaultValue={fieldValue}
                    label={fieldName}
                    accessibilityLabel={fieldName}
                    role={CONST.ROLE.PRESENTATION}
                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                    autoFocus
                />
            </View>
        </FormProvider>
    );
}

export default EditReportFieldDatePage;
