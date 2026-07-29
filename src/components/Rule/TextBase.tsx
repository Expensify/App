import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {isInvalidMerchantValue, isRequiredFulfilled, isValidInputLength} from '@libs/ValidationUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import EXPENSE_RULE_INPUT_IDS from '@src/types/form/ExpenseRuleForm';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';
import {View} from 'react-native';

type TextBaseProps<TFormID extends OnyxFormKey> = {
    fieldID: string;
    hint?: string;
    isRequired?: boolean;
    title: string;
    label: string;
    characterLimit?: number;
    formID: TFormID;
    onSubmit: (values: FormOnyxValues<TFormID>) => void;

    /** Whether to use markdown input type */
    isMarkdownEnabled?: boolean;
};

type TextBasePropsWidened = {
    fieldID: string;
    hint?: string;
    isRequired?: boolean;
    title: string;
    label: string;
    characterLimit?: number;
    formID: OnyxFormKey;
    onSubmit: (values: FormOnyxValues<OnyxFormKey>) => void;
    isMarkdownEnabled?: boolean;
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the component.
 * OXC bails on type params inside components ("Unsupported declaration type for hoisting").
 */
function TextBaseImpl({fieldID, hint, isRequired, title, label, onSubmit, formID, characterLimit = CONST.MERCHANT_NAME_MAX_BYTES, isMarkdownEnabled = false}: TextBasePropsWidened) {
    const {translate} = useLocalize();
    const [form] = useOnyx(formID);
    const styles = useThemeStyles();

    const currentValue = (form as Record<string, unknown>)?.[fieldID] ?? '';
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<OnyxFormKey>) => {
        const errors: FormInputErrors<OnyxFormKey> = {};
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
            } else if (fieldID === EXPENSE_RULE_INPUT_IDS.RENAME_MERCHANT || fieldID === MERCHANT_RULE_INPUT_IDS.MERCHANT) {
                if (trimmedValue && isInvalidMerchantValue(trimmedValue)) {
                    (errors as Record<string, string>)[fieldID] = translate('iou.error.invalidMerchant');
                }
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
            shouldUseStrictHtmlTagValidation
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
                    type={isMarkdownEnabled ? 'markdown' : undefined}
                    autoGrowHeight={isMarkdownEnabled}
                    maxAutoGrowHeight={isMarkdownEnabled ? variables.textInputAutoGrowMaxHeight : undefined}
                    shouldSubmitForm={isMarkdownEnabled}
                />
            </View>
        </FormProvider>
    );
}

function TextBase<TFormID extends OnyxFormKey>(props: TextBaseProps<TFormID>) {
    return <TextBaseImpl {...(props as unknown as TextBasePropsWidened)} />;
}

export default TextBase;
