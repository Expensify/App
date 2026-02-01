import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasCircularReferences} from '@libs/Formula';
import type {FieldList} from '@libs/Formula';
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

    /** Policy field list for circular reference detection */
    fieldList?: FieldList;

    /** Flag to indicate if the input should be disabled */
    disabled?: boolean;
};

function EditReportFieldTextPage({fieldName, onSubmit, fieldValue, isRequired, fieldKey, fieldList, disabled = false}: EditReportFieldTextPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const reportFieldName = Str.UCFirst(fieldName);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM> = {};
            const inputValue = values[fieldKey].trim();

            if (isRequired && inputValue === '') {
                errors[fieldKey] = translate('common.error.fieldRequired');
            }

            if (hasCircularReferences(inputValue, fieldName, fieldList)) {
                errors[fieldKey] = translate('workspace.reportFields.circularReferenceError');
            }

            return errors;
        },
        [fieldName, fieldKey, isRequired, translate, fieldList],
    );

    return (
        <FormProvider
            style={[styles.flexGrow1, styles.ph5]}
            formID={ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM}
            onSubmit={onSubmit}
            validate={validate}
            submitButtonText={translate('common.save')}
            isSubmitButtonVisible={!disabled}
            enabledWhenOffline
            shouldHideFixErrorsAlert
        >
            <View style={styles.mb4}>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={fieldKey}
                    name={fieldKey}
                    defaultValue={fieldValue}
                    label={reportFieldName}
                    accessibilityLabel={reportFieldName}
                    role={CONST.ROLE.PRESENTATION}
                    ref={inputCallbackRef}
                    disabled={disabled}
                />
            </View>
        </FormProvider>
    );
}

export default EditReportFieldTextPage;
