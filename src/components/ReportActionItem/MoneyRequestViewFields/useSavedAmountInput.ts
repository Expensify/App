/**
 * The state of an amount input on the expense view that edits a saved amount in place: it shows the saved amount,
 * keeps what the user types while they type, and saves it when the input is left. Shared by the amount and tax amount
 * inputs so both treat an untouched, cleared or invalid input the same way.
 */
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useMirroredInputValue from '@hooks/useMirroredInputValue';

import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {getBackendAmountFromInput} from '@libs/MoneyRequestUtils';

import type {RefObject} from 'react';

import {useRef, useState} from 'react';

type UseSavedAmountInputParams = {
    /** Saved amount, signed and in the smallest currency unit */
    amount: number;

    /** Decimals of the amount's currency */
    decimals: number;

    /** Error for an amount the user typed, or an empty string when it can be saved */
    getAmountError: (newAmount: number) => string;

    /** Saves a valid typed amount that differs from the saved one */
    onSave: (newAmount: number) => void;
};

type UseSavedAmountInputResult = {
    /** What the input holds */
    inputValue: string;

    /** Error for what the user typed, or an empty string */
    inputError: string;

    /** Key for the input, which keeps what is typed in its own state and so is remounted to show an amount the user didn't type */
    inputKey: string;

    /** For the input's focus */
    startEditing: () => void;

    /** For the input's change: takes what the user typed, saving it right away when the input is not focused, as with the flip button */
    applyTypedAmount: (typedAmount: string) => void;

    /** For the input's blur: validates and saves what the user typed */
    saveTypedAmount: () => void;

    /** For the input's ref, which `blurInput` acts on */
    inputRef: RefObject<BaseTextInputRef | null>;

    /** For the input's submit: the input submits rather than blurs on Enter, so this blurs it to save the typed amount */
    blurInput: () => void;
};

function useSavedAmountInput({amount, decimals, getAmountError, onSave}: UseSavedAmountInputParams): UseSavedAmountInputResult {
    const savedValue = `${amount < 0 ? '-' : ''}${convertToFrontendAmountAsString(Math.abs(amount), decimals)}`;
    const {inputValue, setInputValue, isFocused, startEditing, finishEditing} = useMirroredInputValue(savedValue);
    const [inputError, setInputError] = useState('');
    const [shownSavedValue, setShownSavedValue] = useState(savedValue);
    const [resetCount, setResetCount] = useState(0);
    if (!isFocused && shownSavedValue !== savedValue) {
        setShownSavedValue(savedValue);
        setInputError('');
    }

    const showSavedAmount = () => {
        setInputValue(savedValue);
        setResetCount((count) => count + 1);
    };

    const saveAmount = (typedAmount: string) => {
        const newAmount = getBackendAmountFromInput(typedAmount);
        // A saved expense always has the amount, so a cleared input goes back to the saved one.
        if (newAmount === null) {
            setInputError('');
            showSavedAmount();
            return;
        }
        const amountError = getAmountError(newAmount);
        if (amountError) {
            setInputError(amountError);
            return;
        }
        setInputError('');
        if (newAmount === amount) {
            showSavedAmount();
            return;
        }
        onSave(newAmount);
    };

    const saveTypedAmount = () => {
        const typedAmount = finishEditing();
        // Leaving the input untouched is not an edit, so it neither validates nor saves.
        if (typedAmount === undefined) {
            if (inputError) {
                setInputError('');
                showSavedAmount();
            }
            return;
        }
        saveAmount(typedAmount);
    };

    const applyTypedAmount = (typedAmount: string) => {
        setInputValue(typedAmount);
        setInputError('');
        // The flip button changes the sign without focusing the input, so that change has no blur to save it.
        if (!isFocused) {
            saveAmount(typedAmount);
        }
    };

    const inputRef = useRef<BaseTextInputRef>(null);
    const blurInput = () => {
        inputRef.current?.blur();
    };

    return {inputValue, inputError, inputKey: `${shownSavedValue}-${resetCount}`, startEditing, applyTypedAmount, saveTypedAmount, inputRef, blurInput};
}

export default useSavedAmountInput;
