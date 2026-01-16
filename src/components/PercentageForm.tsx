import type {ForwardedRef} from 'react';
import React, {useCallback, useMemo, useRef} from 'react';
import useLocalize from '@hooks/useLocalize';
import {replaceAllDigits, replaceCommasWithPeriod, stripSpacesFromAmount, validatePercentage} from '@libs/MoneyRequestUtils';
import CONST from '@src/CONST';
import TextInput from './TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from './TextInput/BaseTextInput/types';

type PercentageFormProps = BaseTextInputProps & {
    /** Amount supplied by the FormProvider */
    value?: string;

    /** Error to display at the bottom of the component */
    errorText?: string;

    /** Callback to update the amount in the FormProvider */
    onInputChange?: (value: string) => void;

    /** Custom label for the TextInput */
    label?: string;

    /** Whether to allow values greater than 100 (e.g. split expenses in percentage mode). */
    allowExceedingHundred?: boolean;

    /** Whether to allow one decimal place (0.1 precision) for more granular percentage splits. */
    allowDecimal?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<BaseTextInputRef>;
};

function PercentageForm({value: amount, errorText, onInputChange, label, allowExceedingHundred = false, allowDecimal = false, ref, ...rest}: PercentageFormProps) {
    const {toLocaleDigit, numberFormat} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);

    const currentAmount = useMemo(() => (typeof amount === 'string' ? amount : ''), [amount]);

    /**
     * Sets the amount according to the value passed to the input
     * @param newAmount - Changed amount from user input
     */
    const setNewAmount = useCallback(
        (newAmount: string) => {
            // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
            // More info: https://github.com/Expensify/App/issues/16974
            const newAmountWithoutSpaces = stripSpacesFromAmount(newAmount);
            if (!validatePercentage(newAmountWithoutSpaces, allowExceedingHundred, allowDecimal)) {
                return;
            }

            // Convert comma to period for internal representation (commas are used as decimal separators in some locales like Spanish)
            const normalizedAmount = replaceCommasWithPeriod(newAmountWithoutSpaces);
            onInputChange?.(normalizedAmount);
        },
        [allowExceedingHundred, allowDecimal, onInputChange],
    );

    const formattedAmount = replaceAllDigits(currentAmount, toLocaleDigit);

    return (
        <TextInput
            label={label}
            value={formattedAmount}
            onChangeText={setNewAmount}
            placeholder={numberFormat(0)}
            ref={(newRef: BaseTextInputRef | null) => {
                if (typeof ref === 'function') {
                    ref(newRef);
                } else if (ref && 'current' in ref) {
                    // eslint-disable-next-line no-param-reassign
                    ref.current = newRef;
                }
                textInput.current = newRef;
            }}
            suffixCharacter="%"
            keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
            // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
            // See https://github.com/Expensify/App/issues/51868 for more information
            autoCapitalize="words"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default PercentageForm;
