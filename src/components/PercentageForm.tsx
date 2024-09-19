import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useMemo, useRef, useState} from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import CONST from '@src/CONST';
import TextInput from './TextInput';
import type {BaseTextInputRef} from './TextInput/BaseTextInput/types';

type PercentageFormProps = {
    /** Amount supplied by the FormProvider */
    value?: string;

    /** Error to display at the bottom of the component */
    errorText?: string;

    /** Callback to update the amount in the FormProvider */
    onInputChange?: (value: string) => void;

    /** Custom label for the TextInput */
    label?: string;
};

/**
 * Returns the new selection object based on the updated amount's length
 */
const getNewSelection = (oldSelection: {start: number; end: number}, prevLength: number, newLength: number) => {
    const cursorPosition = oldSelection.end + (newLength - prevLength);
    return {start: cursorPosition, end: cursorPosition};
};

function PercentageForm({value: amount, errorText, onInputChange, label, ...rest}: PercentageFormProps, forwardedRef: ForwardedRef<BaseTextInputRef>) {
    const {toLocaleDigit, numberFormat} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);

    const currentAmount = useMemo(() => (typeof amount === 'string' ? amount : ''), [amount]);

    const [selection, setSelection] = useState({
        start: currentAmount.length,
        end: currentAmount.length,
    });

    const forwardDeletePressedRef = useRef(false);

    /**
     * Sets the selection and the amount accordingly to the value passed to the input
     * @param newAmount - Changed amount from user input
     */
    const setNewAmount = useCallback(
        (newAmount: string) => {
            // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
            // More info: https://github.com/Expensify/App/issues/16974
            const newAmountWithoutSpaces = MoneyRequestUtils.stripSpacesFromAmount(newAmount);
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            if (!MoneyRequestUtils.validatePercentage(newAmountWithoutSpaces)) {
                setSelection((prevSelection) => ({...prevSelection}));
                return;
            }

            const strippedAmount = MoneyRequestUtils.stripCommaFromAmount(newAmountWithoutSpaces);
            const isForwardDelete = currentAmount.length > strippedAmount.length && forwardDeletePressedRef.current;
            setSelection(getNewSelection(selection, isForwardDelete ? strippedAmount.length : currentAmount.length, strippedAmount.length));
            onInputChange?.(strippedAmount);
        },
        [currentAmount, onInputChange, selection],
    );

    const formattedAmount = MoneyRequestUtils.replaceAllDigits(currentAmount, toLocaleDigit);

    return (
        <TextInput
            label={label}
            value={formattedAmount}
            onChangeText={setNewAmount}
            placeholder={numberFormat(0)}
            ref={(ref: BaseTextInputRef) => {
                if (typeof forwardedRef === 'function') {
                    forwardedRef(ref);
                } else if (forwardedRef && 'current' in forwardedRef) {
                    // eslint-disable-next-line no-param-reassign
                    forwardedRef.current = ref;
                }
                textInput.current = ref;
            }}
            selection={selection}
            onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                setSelection(e.nativeEvent.selection);
            }}
            suffixCharacter="%"
            keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

PercentageForm.displayName = 'PercentageForm';

export default forwardRef(PercentageForm);
export type {PercentageFormProps};
