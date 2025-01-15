import React from 'react';
import type {ForwardedRef} from 'react';
import CONST from '@src/CONST';
import TextInput from './TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from './TextInput/BaseTextInput/types';

type AmountFormProps = {
    /** Amount supplied by the FormProvider */
    value?: string;

    /** Callback to update the amount in the FormProvider */
    onInputChange?: (value: string) => void;

    /** Should we allow negative number as valid input */
    shouldAllowNegative?: boolean;
} & Partial<BaseTextInputProps>;

function AmountWithoutCurrencyForm(
    {value: amount, onInputChange, shouldAllowNegative = false, inputID, name, defaultValue, accessibilityLabel, role, label, ...rest}: AmountFormProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    return (
        <TextInput
            inputID={inputID}
            name={name}
            label={label}
            defaultValue={defaultValue}
            accessibilityLabel={accessibilityLabel}
            role={role}
            ref={ref}
            keyboardType={!shouldAllowNegative ? CONST.KEYBOARD_TYPE.DECIMAL_PAD : undefined}
            type="mask"
            mask="[09999999].[99]"
            customNotations={[{character: '.', characterSet: '.', isOptional: true}, {character: ',', characterSet: ',', isOptional: true}]}
            // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
            // See https://github.com/Expensify/App/issues/51868 for more information
            autoCapitalize="words"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

AmountWithoutCurrencyForm.displayName = 'AmountWithoutCurrencyForm';

export default React.forwardRef(AmountWithoutCurrencyForm);
