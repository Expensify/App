import React, {useCallback, useMemo} from 'react';
import type {ForwardedRef} from 'react';
import useLocalize from '@hooks/useLocalize';
import getAmountInputKeyboard from '@libs/getAmountInputKeyboard';
import {replaceAllDigits, replaceCommasWithPeriod, stripSpacesFromAmount} from '@libs/MoneyRequestUtils';
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
    {value: amount, shouldAllowNegative = false, inputID, name, defaultValue, accessibilityLabel, role, label, onInputChange, ...rest}: AmountFormProps,
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
    /**
     * Sets the selection and the amount accordingly to the value passed to the input
     * @param newAmount - Changed amount from user input
     */
    const setNewAmount = useCallback(
        (newAmount: string) => {
            // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
            // More info: https://github.com/Expensify/App/issues/16974
            const newAmountWithoutSpaces = stripSpacesFromAmount(newAmount);
            const replacedCommasAmount = replaceCommasWithPeriod(newAmountWithoutSpaces);
            onInputChange?.(replacedCommasAmount);
        },
        [onInputChange],
    );

    // Add custom notation for using '-' character in the mask.
    // If we only use '-' for characterSet instead of '0123456789.-'
    // then the first character has to be '-' optionally, but we also want to allow a digit in first position if the value is positive.
    // More info: https://github.com/IvanIhnatsiuk/react-native-advanced-input-mask?tab=readme-ov-file#custom-notations
    const customMask = [
        {
            character: '~',
            characterSet: '0123456789.-',
            isOptional: true,
        },
    ];

    const {keyboardType, inputMode} = getAmountInputKeyboard(shouldAllowNegative);

    return (
        <TextInput
            inputID={inputID}
            name={name}
            label={label}
            onChangeText={setNewAmount}
            defaultValue={defaultValue}
            accessibilityLabel={accessibilityLabel}
            role={role}
            ref={ref}
            keyboardType={keyboardType}
            inputMode={inputMode}
            type="mask"
            mask={shouldAllowNegative ? `[~][99999999]${separator}[09]` : `[09999999]${separator}[09]`}
            customNotations={customMask}
            allowedKeys="0123456789.,-"
            validationRegex={'^-?(?!.*[.,].*[.,])\\d{0,8}(?:[.,]\\d{0,2})?$'}
            // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
            // See https://github.com/Expensify/App/issues/51868 for more information
            autoCapitalize="words"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

AmountWithoutCurrencyInput.displayName = 'AmountWithoutCurrencyInput';

export default React.forwardRef(AmountWithoutCurrencyInput);
