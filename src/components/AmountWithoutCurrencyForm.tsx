import React, {useCallback, useMemo} from 'react';
import type {ForwardedRef} from 'react';
import useLocalize from '@hooks/useLocalize';
import {addLeadingZero, replaceAllDigits, replaceCommasWithPeriod, stripSpacesFromAmount, validateAmount} from '@libs/MoneyRequestUtils';
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
    const {toLocaleDigit} = useLocalize();

    const currentAmount = useMemo(() => (typeof amount === 'string' ? amount : ''), [amount]);

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
            const withLeadingZero = addLeadingZero(replacedCommasAmount, shouldAllowNegative);
            if (!validateAmount(withLeadingZero, 2, CONST.IOU.AMOUNT_MAX_LENGTH, shouldAllowNegative)) {
                return;
            }
            onInputChange?.(withLeadingZero);
        },
        [onInputChange, shouldAllowNegative],
    );

    const formattedAmount = replaceAllDigits(currentAmount, toLocaleDigit);

    return (
        <TextInput
            value={formattedAmount}
            onChangeText={setNewAmount}
            inputID={inputID}
            name={name}
            label={label}
            defaultValue={defaultValue}
            accessibilityLabel={accessibilityLabel}
            role={role}
            ref={ref}
            keyboardType={!shouldAllowNegative ? CONST.KEYBOARD_TYPE.DECIMAL_PAD : undefined}
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
