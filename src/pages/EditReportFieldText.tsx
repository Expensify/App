import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type EditReportFieldTextPageProps = {
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

function EditReportFieldTextPage({fieldName, onSubmit, fieldValue, isRequired, fieldKey}: EditReportFieldTextPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM> = {};
            if (isRequired && values[fieldKey].trim() === '') {
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
        >
            <View style={styles.mb4}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={fieldKey}
                    name={fieldKey}
                    defaultValue={fieldValue}
                    label={fieldName}
                    accessibilityLabel={fieldName}
                    role={CONST.ROLE.PRESENTATION}
                    ref={inputCallbackRef}
                />
            </View>
        </FormProvider>
    );
}

EditReportFieldTextPage.displayName = 'EditReportFieldTextPage';

export default EditReportFieldTextPage;
