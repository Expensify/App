import React, {useMemo} from 'react';
import type {ForwardedRef} from 'react';
import useLocalize from '@hooks/useLocalize';
import {replaceAllDigits} from '@libs/MoneyRequestUtils';
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

function AmountWithoutCurrencyInput(
    {value: amount, shouldAllowNegative = false, inputID, name, defaultValue, accessibilityLabel, role, label, ...rest}: AmountFormProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const {toLocaleDigit} = useLocalize();
    const separator = useMemo(
        () =>
            replaceAllDigits('1.1', toLocaleDigit)
                .split('')
                .filter((char) => char !== '1')
                .join(''),
        [toLocaleDigit],
    );

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
            mask={`[09999999]${separator}[09]`}
            allowedKeys="0123456789.,"
            // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
            // See https://github.com/Expensify/App/issues/51868 for more information
            autoCapitalize="words"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

AmountWithoutCurrencyInput.displayName = 'AmountWithoutCurrencyForm';

export default React.forwardRef(AmountWithoutCurrencyInput);
