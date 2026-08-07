/**
 * Shared IBAN + SWIFT/BIC input fields, used by both the personal and Corpay international bank account flows.
 */
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {TextInput as RNTextInput} from 'react-native';

import React from 'react';

const IBAN_INPUT_ID = 'iban';
const SWIFT_CODE_INPUT_ID = 'swiftCode';

type InternationalBankAccountFieldsProps = {
    /** Pre-filled IBAN value, if one is already known */
    ibanDefaultValue?: string;

    /** Pre-filled SWIFT/BIC code value, if one is already known */
    swiftCodeDefaultValue?: string;

    /**
     * Whether keystrokes are persisted to the form draft immediately. This must be false while editing so the
     * change is only committed to the draft when the user presses confirm, not on every keystroke.
     */
    shouldSaveDraft: boolean;

    /** Ref callback used to auto-focus the IBAN input, if the consumer needs it */
    inputCallbackRef?: (ref: RNTextInput | null) => void;
};

function InternationalBankAccountFields({ibanDefaultValue = '', swiftCodeDefaultValue = '', shouldSaveDraft, inputCallbackRef}: InternationalBankAccountFieldsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            <InputWrapper
                InputComponent={TextInput}
                ref={inputCallbackRef}
                inputID={IBAN_INPUT_ID}
                label={translate('bankAccount.iban')}
                aria-label={translate('bankAccount.iban')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={ibanDefaultValue}
                shouldSaveDraft={shouldSaveDraft}
            />
            <InputWrapper
                InputComponent={TextInput}
                inputID={SWIFT_CODE_INPUT_ID}
                containerStyles={[styles.mt6]}
                label={translate('bankAccount.swiftBicCode')}
                aria-label={translate('bankAccount.swiftBicCode')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={swiftCodeDefaultValue}
                shouldSaveDraft={shouldSaveDraft}
            />
        </>
    );
}

InternationalBankAccountFields.displayName = 'InternationalBankAccountFields';

export default InternationalBankAccountFields;
export {IBAN_INPUT_ID, SWIFT_CODE_INPUT_ID};
