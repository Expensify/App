import type {NumberFormInputKeyPressEvent} from '@components/NumberForm/types';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';

import {isMobileSafari} from '@libs/Browser';
import getOperatingSystem from '@libs/getOperatingSystem';
import {addLeadingZero, replaceAllDigits, replaceCommasWithPeriod, stripCommaFromAmount, stripDecimalsFromAmount, stripSpacesFromAmount, validateAmount} from '@libs/MoneyRequestUtils';
import shouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually';

import CONST from '@src/CONST';

import type {BlurEvent} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';

type NumberSelection = {
    start: number;
    end: number;
};

type UseNumberEditControllerParams = {
    /** Externally controlled value. The controller re-initializes only when it resets to an empty string. */
    value?: string;

    /** Called with the canonical signed value whenever the user edits the number. */
    onInputChange?: (value: string) => void;

    /** Whether negative values are allowed. The canonical value always stores its sign. */
    allowNegative?: boolean;

    /** Number of decimal places accepted by the controller. */
    decimals?: number;

    /** Maximum number of integer digits accepted by the controller. */
    maxLength?: number;

    /** Blur callback forwarded by the form (InputWrapper). */
    onBlur?: BaseTextInputProps['onBlur'];

    /**
     * Maps a canonical value to the text the composed input displays. Defaults to identity. A root that presents part
     * of the value outside the input (e.g. NumberComposer rendering the minus separately) supplies its projection here;
     * the selection always tracks the displayed text.
     */
    toDisplayText?: (canonicalValue: string) => string;

    /**
     * Maps validated display text back to the next canonical value, given the previously committed canonical value.
     * Defaults to identity. NumberComposer uses this to preserve the sign the input does not display.
     */
    toCanonicalValue?: (displayText: string, previousCanonicalValue: string) => string;
};

const toDisplayTextDefault = (canonicalValue: string) => canonicalValue;
const toCanonicalValueDefault = (displayText: string) => displayText;

/**
 * Returns the new selection object based on the updated number's length.
 */
const getNewSelection = (oldSelection: NumberSelection, previousLength: number, newLength: number): NumberSelection => {
    const cursorPosition = oldSelection.end + (newLength - previousLength);
    return {start: cursorPosition, end: cursorPosition};
};

/**
 * Root-instantiated controller for editing a numeric string. Owns the canonical signed value, the selection, the
 * selection guards, normalization, validation, and the imperative editing API. Composed input primitives consume it
 * through the NumberForm contexts; other roots (NumberComposer) can instantiate it directly.
 */
function useNumberEditController({
    value: externalValueProp,
    onInputChange,
    allowNegative = false,
    decimals = 0,
    maxLength,
    onBlur,
    toDisplayText = toDisplayTextDefault,
    toCanonicalValue = toCanonicalValueDefault,
}: UseNumberEditControllerParams) {
    const {fromLocaleDigit, toLocaleDigit} = useLocalize();
    const externalValue = externalValueProp ?? '';

    const [currentValue, setCurrentValue] = useState(externalValue);
    const [previousExternalValue, setPreviousExternalValue] = useState(externalValue);
    // Tracks the latest committed value synchronously because state updates may be batched; this lets edits read the
    // correct previous value even when the value changes more than once before a render.
    const committedValueRef = useRef(externalValue);

    const initialDisplayLength = toDisplayText(externalValue).length;
    const [selection, setSelection] = useState<NumberSelection>({start: initialDisplayLength, end: initialDisplayLength});

    // Transient number set alongside a manual value update. On iOS / Android the selection event emitted in the same
    // batch still reads the pre-update text, so this lets handleSelectionChange clamp against the new text.
    const numberRef = useRef<string | undefined>(undefined);
    const forwardDeletePressedRef = useRef(false);
    // Set while a value update also moves the selection manually, so the stale native selection event emitted in the
    // same batch is dropped.
    const willSelectionBeUpdatedManually = useRef(false);
    // Decimal changes need to be handled once, rather than on every render.
    const previousDecimals = useRef<number | undefined>(undefined);

    const isFocused = useIsFocused();
    const wasFocused = usePrevious(isFocused);

    // Keep externally controlled form values in sync with the editing state. Matching the legacy NumberWithSymbolForm,
    // only a reset to an empty value re-initializes the editing state; any other external change is intentionally
    // ignored so a parent re-render with a reformatted value cannot clobber an in-progress edit. External pushes go
    // through updateNumber instead.
    if (previousExternalValue !== externalValue) {
        setPreviousExternalValue(externalValue);
        if (externalValue === '') {
            setCurrentValue('');
            setSelection({start: 0, end: 0});
        }
    }

    useLayoutEffect(() => {
        committedValueRef.current = currentValue;
    }, [currentValue]);

    const isNegative = currentValue.startsWith('-');
    const formattedNumber = replaceAllDigits(toDisplayText(currentValue), toLocaleDigit);

    const clearSelection = () => {
        setSelection((currentSelection) => ({start: currentSelection.end, end: currentSelection.end}));
    };

    // Clears text selection if the user visits another screen (e.g. the currency selector) and comes back.
    useEffect(() => {
        if (!isFocused || wasFocused) {
            return;
        }

        // Focus regain is a navigation lifecycle event; collapse stale selection after returning from a child screen.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        clearSelection();
    }, [isFocused, wasFocused, clearSelection]);

    /** Commits a canonical value. Returns the previously committed canonical value. */
    const applyValue = (nextValue: string, {notify = true}: {notify?: boolean} = {}) => {
        const previousValue = committedValueRef.current;

        committedValueRef.current = nextValue;
        setCurrentValue(nextValue);

        if (notify) {
            onInputChange?.(nextValue);
        }

        return previousValue;
    };


    const setNumber = (inputValue: string) => {
        // Remove spaces from the new number because Safari on iOS adds spaces when pasting a copied number
        // More info: https://github.com/Expensify/App/issues/16974
        const inputWithoutSpaces = stripSpacesFromAmount(inputValue);
        const newNumberWithoutSpaces = replaceAllDigits(inputWithoutSpaces, fromLocaleDigit);
        const rawFinalNumber = newNumberWithoutSpaces.includes('.') ? stripCommaFromAmount(newNumberWithoutSpaces) : replaceCommasWithPeriod(newNumberWithoutSpaces);

        const numberWithLeadingZero = addLeadingZero(rawFinalNumber, allowNegative);

        if (!validateAmount(numberWithLeadingZero, decimals, maxLength, allowNegative)) {
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            setSelection((currentSelection) => ({...currentSelection}));
            return;
        }

        const nextCanonicalValue = toCanonicalValue(numberWithLeadingZero, committedValueRef.current);
        const nextDisplayText = toDisplayText(nextCanonicalValue);

        // Keep this set through the current batch so a stale native selection event is dropped; it is cleared after the
        // committed value render so a later legitimate selection event is applied.
        willSelectionBeUpdatedManually.current = true;
        numberRef.current = nextDisplayText;

        const previousDisplayText = toDisplayText(applyValue(nextCanonicalValue));
        const isForwardDelete = previousDisplayText.length > nextDisplayText.length && forwardDeletePressedRef.current;
        setSelection((currentSelection) => getNewSelection(currentSelection, isForwardDelete ? nextDisplayText.length : previousDisplayText.length, nextDisplayText.length));
    };

    useEffect(() => {
        const hasDecimalsChanged = previousDecimals.current === undefined || previousDecimals.current !== decimals;
        previousDecimals.current = decimals;

        // If the field is intentionally empty (e.g. new manual expense flow before the user enters an amount)
        // or the current number is already valid for the new decimal count, nothing to do.
        if (!hasDecimalsChanged || externalValue === '' || validateAmount(currentValue, decimals, maxLength, allowNegative)) {
            return;
        }

        setNumber(toDisplayText(stripDecimalsFromAmount(currentValue)));
    }, [allowNegative, decimals, externalValue, maxLength, setNumber, toDisplayText, currentValue]);

    useLayoutEffect(() => {
        // A manual update can change only the selection (for example, when setNumber() or updateNumber() receives the
        // value that is already committed). In that case `currentValue` does not change, so include `selection` to
        // ensure the guard is still cleared after the manually controlled selection has committed.
        willSelectionBeUpdatedManually.current = false;
    }, [selection, currentValue]);

    /** Replaces the canonical value without validation or notification and moves the caret to the end. */
    const updateNumber = (newNumber: string) => {
        willSelectionBeUpdatedManually.current = true;
        const nextDisplayText = toDisplayText(newNumber);
        numberRef.current = nextDisplayText;
        applyValue(newNumber, {notify: false});
        setSelection({start: nextDisplayText.length, end: nextDisplayText.length});
    };

    /** Returns the canonical signed value. */
    const getNumber = () => committedValueRef.current;

    /**
     * Commits a canonical value without validation and without moving the caret, notifying the parent by default.
     * For root-level edits that do not change the displayed text (e.g. NumberComposer toggling the separate sign).
     */
    const setValue = (nextValue: string, {notify = true}: {notify?: boolean} = {}) => {
        applyValue(nextValue, {notify});
    };

    const handleSelectionChange = (selectionStart: number, selectionEnd: number) => {
        if (shouldIgnoreSelectionWhenUpdatedManually && willSelectionBeUpdatedManually.current) {
            willSelectionBeUpdatedManually.current = false;
            return;
        }

        // When the number is updated in setNumber on iOS / Android, onSelectionChange still reads the number before the
        // update. Using numberRef allows us to clamp against the updated number.
        const maxSelection = numberRef.current?.length ?? formattedNumber.length;
        numberRef.current = undefined;
        setSelection({
            start: Math.min(selectionStart, maxSelection),
            end: Math.min(selectionEnd, maxSelection),
        });
    };

    const handleBlur = (event: BlurEvent) => {
        onBlur?.(event);
    };

    /**
     * Input handler to check for a forward-delete key (or keyboard shortcut) press.
     */
    const handleKeyPress = (event: NumberFormInputKeyPressEvent) => {
        const key = event.nativeEvent.key.toLowerCase();

        if (isMobileSafari() && key === CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            // Optimistically anticipate forward-delete on iOS Safari (in cases where the Mac Accessibility keyboard is being
            // used for input). If the Control-D shortcut doesn't get sent, the ref will still be reset on the next key press.
            forwardDeletePressedRef.current = true;
            return;
        }

        const operatingSystem = getOperatingSystem();
        const isMacOrIOS = operatingSystem === CONST.OS.MAC_OS || operatingSystem === CONST.OS.IOS;
        // Control-D on Mac is a keyboard shortcut for forward-delete. See https://support.apple.com/en-us/HT201236 for Mac keyboard shortcuts.
        // Also check for the keyboard shortcut on iOS in cases where a hardware keyboard may be connected to the device.
        forwardDeletePressedRef.current = key === 'delete' || (isMacOrIOS && !!event.nativeEvent.ctrlKey && key === 'd');
    };

    // An external value can shrink between native selection events; never render a caret past the displayed text.
    const selectionForRender = {
        start: Math.min(selection.start, formattedNumber.length),
        end: Math.min(selection.end, formattedNumber.length),
    };

    return {
        value: currentValue,
        externalValue,
        formattedNumber,
        isNegative,
        selection: selectionForRender,
        setNumber,
        setValue,
        updateNumber,
        getNumber,
        clearSelection,
        handleSelectionChange,
        handleKeyPress,
        handleBlur,
    };
}

export default useNumberEditController;
export type {UseNumberEditControllerParams};
