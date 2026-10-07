import type {NumericEditingKeyPressEvent, NumericEditingRef} from '@components/NumericEditingController/types';
import {normalizeNumericInput} from '@components/NumericEditingController/utils';

import useLocalize from '@hooks/useLocalize';

import {stripSpacesFromAmount, validateAmount} from '@libs/MoneyRequestUtils';

import type {ForwardedRef, RefObject} from 'react';

import {useImperativeHandle, useState} from 'react';

import type {NumberWithSymbolFormRef} from './types';

type UseParentOwnedSignParams = {
    /** Value the caller holds: the magnitude when it owns the sign (possibly still signed, see `isParentNegative`), the signed value otherwise */
    value: string;

    /** Sign the caller holds next to the magnitude */
    isNegative: boolean;

    /** Whether the form renders as a text input, which keeps the sign inside the typed value */
    displayAsTextInput: boolean;

    /** Whether the caller lets the user flip the sign */
    allowFlippingAmount: boolean;

    /** Whether the caller passes a signed value directly (split amounts), which keeps the sign inside the value */
    allowNegativeInput: boolean;

    /** Number of decimal places the root accepts, used to validate a magnitude typed after a minus */
    decimals: number;

    /** Maximum number of integer digits the root accepts, used to validate a magnitude typed after a minus */
    maxLength?: number;

    /** Caller callback receiving the magnitude (or the signed value when the root owns the sign) */
    onInputChange?: (value: string) => void;

    /** Caller callback flipping its sign */
    toggleNegative?: () => void;

    /** Caller callback clearing its negative sign */
    clearNegative?: () => void;

    /** Ref of the NumericInput or NumericField root the adapter renders */
    editingRef: RefObject<NumericEditingRef | null>;

    /** Legacy imperative ref exposed to the caller */
    numberFormRef?: ForwardedRef<NumberWithSymbolFormRef>;
};

type ParentOwnedSign = {
    /** Value handed to the root: the magnitude when the caller owns the sign, the signed value otherwise */
    rootValue: string;

    /** Whether the caller owns the sign through `isNegative`. The root then only ever holds the magnitude. */
    isSignOwnedByParent: boolean;

    /** Whether the caller's minus sign is shown beside the magnitude */
    isParentNegative: boolean;

    /** Whether the caller's sign can be shown at all, now or after a flip, so the sign needs its own place in the layout */
    canShowParentSign: boolean;

    /** Flips the caller's sign. Set only when the user may change it; the Split Bill total, for one, only shows its sign. */
    flipParentSign?: () => void;

    /** Whether the flip button toggles the root's own sign, for a caller that keeps the sign inside the value */
    shouldShowRootFlipButton: boolean;

    /** Text change handler wrapping the root's, which turns a leading minus into a flip of the caller's sign */
    setNumber: (text: string, setRootNumber: (text: string) => void) => void;

    /** Key press handler clearing the caller's sign when Backspace is pressed on an empty amount */
    handleKeyPress: (event: NumericEditingKeyPressEvent) => void;
};

const stripSign = (number: string) => (number.startsWith('-') ? number.slice(1) : number);

/**
 * Keeps the legacy parent-owned sign (`value` magnitude + `isNegative` + `toggleNegative`/`clearNegative`) entirely inside the
 * adapter. When the caller owns the sign, the NumericInput root only ever receives and reports the magnitude, so its own sign
 * rules (a typed minus, a replaced number, a Backspace before the digits) never apply. The adapter shows the caller's sign and
 * reports the user's sign gestures straight to the caller, one callback per gesture, without mirroring the sign into the root.
 * It also exposes the legacy `NumberWithSymbolFormRef` on top of the root's editing ref.
 */
function useParentOwnedSign({
    value,
    isNegative,
    displayAsTextInput,
    allowFlippingAmount,
    allowNegativeInput,
    decimals,
    maxLength,
    onInputChange,
    toggleNegative,
    clearNegative,
    editingRef,
    numberFormRef,
}: UseParentOwnedSignParams): ParentOwnedSign {
    const {fromLocaleDigit} = useLocalize();

    // The text input path and split amounts keep the sign inside the value, so only the other callers own it
    const isSignOwnedByParent = !displayAsTextInput && !allowNegativeInput;

    // Some callers (MoneyRequestAmountForm) pass the formatted draft amount with its sign and derive `isNegative` from it only after
    // mounting. Until the caller first changes `isNegative`, a signed value therefore shows the sign; from then on `isNegative` alone
    // decides, even though such callers keep passing the stale signed draft while the user edits.
    const [hasCallerSetSign, setHasCallerSetSign] = useState(false);
    const [previousIsNegative, setPreviousIsNegative] = useState(isNegative);
    if (previousIsNegative !== isNegative) {
        setPreviousIsNegative(isNegative);
        setHasCallerSetSign(true);
    }
    const isParentNegative = isSignOwnedByParent && (isNegative || (!hasCallerSetSign && value.startsWith('-')));

    // Without the permission to flip (e.g. the Split Bill total) the caller's sign is only displayed, never changed by the user
    const canChangeSign = isSignOwnedByParent && allowFlippingAmount && !!toggleNegative;

    useImperativeHandle(numberFormRef, () => ({
        clearSelection: () => editingRef.current?.clearSelection(),
        getNumber: () => editingRef.current?.getNumber() ?? '',
        updateNumber: (newNumber: string) => {
            if (!isSignOwnedByParent) {
                editingRef.current?.updateNumber(newNumber);
                return;
            }

            // A signed number makes the amount negative. Only a positive amount flips the caller's sign, so re-applying the negative
            // amount the form already shows (e.g. the formatted draft amount) is not a flip.
            if (canChangeSign && newNumber.startsWith('-') && !isParentNegative) {
                toggleNegative?.();
            }

            // The root holds the magnitude only, since the caller keeps the sign
            editingRef.current?.updateNumber(stripSign(newNumber));
        },
    }));

    const setNumber = (text: string, setRootNumber: (text: string) => void) => {
        const textWithoutSpaces = stripSpacesFromAmount(text);
        if (!canChangeSign || !textWithoutSpaces.startsWith('-')) {
            // The root holds the magnitude without negative values allowed, so it rejects any minus the caller does not let the user type
            setRootNumber(text);
            return;
        }

        // A leading minus (typed, pasted, or entered by an IME) flips the caller's sign, the same way the legacy form did
        const magnitude = normalizeNumericInput(textWithoutSpaces.slice(1), {fromLocaleDigit});
        if (!validateAmount(magnitude, decimals, maxLength)) {
            // Let the root reject the edit and restore its caret. A rejected edit leaves the sign as it was.
            setRootNumber(text);
            return;
        }

        const previousMagnitude = editingRef.current?.getNumber() ?? '';
        setRootNumber(magnitude);

        // The root only notifies a changed magnitude, while the legacy form reported every accepted edit, so a minus typed in front
        // of the same digits still reports them
        if (magnitude === previousMagnitude) {
            onInputChange?.(magnitude);
        }

        // The magnitude is committed first, so a caller that reports its signed amount when the sign flips reads the new digits
        toggleNegative?.();
    };

    const handleKeyPress = (event: NumericEditingKeyPressEvent) => {
        // Backspace leaves an empty amount unchanged, so it only reaches the adapter as a key press
        if (!canChangeSign || !isParentNegative || event.nativeEvent.key.toLowerCase() !== 'backspace' || (editingRef.current?.getNumber() ?? '') !== '') {
            return;
        }

        if (clearNegative) {
            clearNegative();
            return;
        }

        toggleNegative?.();
    };

    return {
        rootValue: isSignOwnedByParent ? stripSign(value) : value,
        isSignOwnedByParent,
        isParentNegative,
        canShowParentSign: isParentNegative || (isSignOwnedByParent && allowFlippingAmount),
        flipParentSign: canChangeSign ? toggleNegative : undefined,
        shouldShowRootFlipButton: !isSignOwnedByParent && allowFlippingAmount,
        setNumber,
        handleKeyPress,
    };
}

/** Text shown beside the number, counted by the root's dynamic font size: the caller's minus sign (shown by the adapter) and the symbol */
function getSizedAdornment(symbol: string, sign: ParentOwnedSign) {
    return sign.isParentNegative ? `-${symbol}` : symbol;
}

export default useParentOwnedSign;
export {getSizedAdornment};
export type {ParentOwnedSign};
