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
import type {OnyxFormKey} from '@src/ONYXKEYS';

type TextBaseProps<TFormID extends OnyxFormKey> = {
    fieldID: string;
    hint?: string;
    isRequired?: boolean;
    title: string;
    label: string;
    characterLimit?: number;
    formID: TFormID;
    onSubmit: (values: FormOnyxValues<TFormID>) => void;
};

function TextBase<TFormID extends OnyxFormKey>({fieldID, hint, isRequired, title, label, onSubmit, formID, characterLimit = CONST.MERCHANT_NAME_MAX_BYTES}: TextBaseProps<TFormID>) {
    const {translate} = useLocalize();
    const [form] = useOnyx(formID, {canBeMissing: true});
    const styles = useThemeStyles();

    const currentValue = (form as Record<string, unknown>)?.[fieldID] ?? '';
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<TFormID>) => {
        const errors: FormInputErrors<TFormID> = {};
        const fieldValue = (values as Record<string, unknown>)[fieldID] ?? '';

        if (typeof fieldValue !== 'string') {
            return errors;
        }

        const trimmedValue = fieldValue.trim();

        if (isRequired && !isRequiredFulfilled(fieldValue)) {
            (errors as Record<string, string>)[fieldID] = translate('common.error.fieldRequired');
        } else {
            const {isValid, byteLength} = isValidInputLength(trimmedValue, characterLimit);

            if (!isValid) {
                (errors as Record<string, string>)[fieldID] = translate('common.error.characterLimitExceedCounter', byteLength, characterLimit);
            }
        }

        return errors;
    };

    return (
        <FormProvider
            style={[styles.flex1, styles.ph5]}
            formID={formID}
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
