import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isRequiredFulfilled, isValidInputLength} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InputID} from '@src/types/form/ExpenseRuleForm';

type TextBaseProps = {
    fieldID: InputID;
    hint?: string;
    isRequired?: boolean;
    title: string;
    label: string;
    characterLimit?: number;
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM>) => void;
};

function TextBase({fieldID, hint, isRequired, title, label, onSubmit, characterLimit = CONST.MERCHANT_NAME_MAX_BYTES}: TextBaseProps) {
    const {translate} = useLocalize();
    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    const styles = useThemeStyles();

    const currentValue = form?.[fieldID] ?? '';
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EXPENSE_RULE_FORM> = {};
        const fieldValue = values[fieldID] ?? '';

        if (typeof fieldValue !== 'string') {
            return errors;
        }

        const trimmedValue = fieldValue.trim();

        if (isRequired && !isRequiredFulfilled(fieldValue)) {
            errors[fieldID] = translate('common.error.fieldRequired');
        } else {
            const {isValid, byteLength} = isValidInputLength(trimmedValue, characterLimit);

            if (!isValid) {
                errors[fieldID] = translate('common.error.characterLimitExceedCounter', byteLength, characterLimit);
            }
        }

        return errors;
    };

    return (
        <FormProvider
            style={[styles.flex1, styles.ph5]}
            formID={ONYXKEYS.FORMS.EXPENSE_RULE_FORM}
            validate={validate}
            onSubmit={onSubmit}
            submitButtonText={translate('common.save')}
            enabledWhenOffline
        >
            <View style={styles.mb5}>
                <InputWrapper
                    hint={hint}
                    InputComponent={TextInput}
                    inputID={fieldID}
                    name={fieldID}
                    defaultValue={typeof currentValue === 'string' ? currentValue : undefined}
                    label={label}
                    accessibilityLabel={title}
                    role={CONST.ROLE.PRESENTATION}
                    ref={inputCallbackRef}
                />
            </View>
        </FormProvider>
    );
}

export default TextBase;
