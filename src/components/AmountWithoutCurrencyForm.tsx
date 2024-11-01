import React, {useCallback, useMemo, useState} from 'react';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import {addLeadingZero, amountRegex, replaceAllDigits, replaceCommasWithPeriod, stripSpacesFromAmount, validateAmount} from '@libs/MoneyRequestUtils';
import CONST from '@src/CONST';
import TextInput from './TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from './TextInput/BaseTextInput/types';

type AmountFormProps = {
    /** Amount supplied by the FormProvider */
    value?: string;

    /** Callback to update the amount in the FormProvider */
    onInputChange?: (value: string) => void;
} & Partial<BaseTextInputProps>;

function AmountWithoutCurrencyForm(
    {value: amount, onInputChange, inputID, name, defaultValue, accessibilityLabel, role, label, ...rest}: AmountFormProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const {toLocaleDigit} = useLocalize();

    const currentAmount = useMemo(() => (typeof amount === 'string' ? amount : ''), [amount]);
    const [selection, setSelection] = useState({
        start: currentAmount.length,
        end: currentAmount.length,
    });
    const decimals = 2;

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
            const withLeadingZero = addLeadingZero(replacedCommasAmount);
            if (!validateAmount(withLeadingZero, decimals)) {
                // Use a shallow copy of selection to trigger setSelection
                // More info: https://github.com/Expensify/App/issues/16385
                setSelection((prevSelection) => ({...prevSelection}));
                return;
            }
            onInputChange?.(withLeadingZero);
        },
        [onInputChange],
    );

    const regex = useMemo(() => amountRegex(decimals), [decimals]);
    const formattedAmount = replaceAllDigits(currentAmount, toLocaleDigit);

    return (
        <TextInput
            value={formattedAmount}
            onChangeText={setNewAmount}
            selection={selection}
            onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                setSelection(e.nativeEvent.selection);
            }}
            inputID={inputID}
            name={name}
            label={label}
            defaultValue={defaultValue}
            accessibilityLabel={accessibilityLabel}
            role={role}
            ref={ref}
            keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
            regex={regex}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

AmountWithoutCurrencyForm.displayName = 'AmountWithoutCurrencyForm';

export default React.forwardRef(AmountWithoutCurrencyForm);
