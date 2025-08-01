import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import type {NativeSyntheticEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import {useMouseContext} from '@hooks/useMouseContext';
import {isMobileSafari} from '@libs/Browser';
import {convertToFrontendAmountAsString, getCurrencyDecimals} from '@libs/CurrencyUtils';
import getOperatingSystem from '@libs/getOperatingSystem';
import {replaceAllDigits, replaceCommasWithPeriod, stripCommaFromAmount, stripDecimalsFromAmount, stripSpacesFromAmount, validateAmount} from '@libs/MoneyRequestUtils';
import shouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually';
import CONST from '@src/CONST';
import isTextInputFocused from './TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from './TextInput/BaseTextInput/types';
import TextInputWithCurrencySymbol from './TextInputWithCurrencySymbol';
import type {TextInputWithCurrencySymbolProps} from './TextInputWithCurrencySymbol/types';

type MoneyRequestAmountInputRef = {
    setNewAmount: (amountValue: string) => void;
    changeSelection: (newSelection: Selection) => void;
    changeAmount: (newAmount: string) => void;
    getAmount: () => string;
    getSelection: () => Selection;
};

type MoneyRequestAmountInputProps = {
    /** IOU amount saved in Onyx */
    amount?: number;

    /** A callback to format the amount number */
    onFormatAmount?: (amount: number, currency?: string) => string;

    /** Currency chosen by user or saved in Onyx */
    currency?: string;

    /** Whether the currency symbol is pressable */
    isCurrencyPressable?: boolean;

    /** Fired when back button pressed, navigates to currency selection page */
    onCurrencyButtonPress?: () => void;

    /** Function to call when the amount changes */
    onAmountChange?: (amount: string) => void;

    /** Whether to update the selection */
    shouldUpdateSelection?: boolean;

    /** Style for the input */
    inputStyle?: StyleProp<TextStyle>;

    /** Style for the container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Reference to moneyRequestAmountInputRef */
    moneyRequestAmountInputRef?: ForwardedRef<MoneyRequestAmountInputRef>;

    /** Character to be shown before the amount */
    prefixCharacter?: string;

    /** Whether to hide the currency symbol */
    hideCurrencySymbol?: boolean;

    /** Whether to disable native keyboard on mobile */
    disableKeyboard?: boolean;

    /** Style for the prefix */
    prefixStyle?: StyleProp<TextStyle>;

    /** Style for the prefix container */
    prefixContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the touchable input wrapper */
    touchableInputWrapperStyle?: StyleProp<ViewStyle>;

    /** Whether we want to format the display amount on blur */
    formatAmountOnBlur?: boolean;

    /** Max length for the amount input */
    maxLength?: number;

    /** Hide the focus styles on TextInput */
    hideFocusedState?: boolean;

    /** Whether the user input should be kept or not */
    shouldKeepUserInput?: boolean;

    /**
     * Auto grow input container length based on the entered text.
     */
    autoGrow?: boolean;

    /** The width of inner content */
    contentWidth?: number;

    /** Whether to apply padding to the input, some inputs doesn't require any padding, e.g. Amount input in money request flow */
    shouldApplyPaddingToContainer?: boolean;

    /** The testID of the input. Used to locate this view in end-to-end tests. */
    testID?: string;
} & Pick<TextInputWithCurrencySymbolProps, 'autoGrowExtraSpace' | 'submitBehavior' | 'shouldUseDefaultLineHeightForPrefix'>;

type Selection = {
    start: number;
    end: number;
};

/**
 * Returns the new selection object based on the updated amount's length
 */
const getNewSelection = (oldSelection: Selection, prevLength: number, newLength: number): Selection => {
    const cursorPosition = oldSelection.end + (newLength - prevLength);
    return {start: cursorPosition, end: cursorPosition};
};

const defaultOnFormatAmount = (amount: number, currency?: string) => convertToFrontendAmountAsString(amount, currency ?? CONST.CURRENCY.USD);

function MoneyRequestAmountInput(
    {
        amount = 0,
        currency = CONST.CURRENCY.USD,
        isCurrencyPressable = true,
        onCurrencyButtonPress,
        onAmountChange,
        prefixCharacter = '',
        hideCurrencySymbol = false,
        shouldUpdateSelection = true,
        moneyRequestAmountInputRef,
        disableKeyboard = true,
        onFormatAmount = defaultOnFormatAmount,
        formatAmountOnBlur,
        maxLength,
        hideFocusedState = true,
        shouldKeepUserInput = false,
        autoGrow = true,
        autoGrowExtraSpace,
        contentWidth,
        testID,
        submitBehavior,
        shouldApplyPaddingToContainer = false,
        shouldUseDefaultLineHeightForPrefix = true,
        ...props
    }: MoneyRequestAmountInputProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const {toLocaleDigit, numberFormat} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);

    const amountRef = useRef<string | undefined>(undefined);

    const decimals = getCurrencyDecimals(currency);
    const selectedAmountAsString = amount ? onFormatAmount(amount, currency) : '';

    const [currentAmount, setCurrentAmount] = useState(selectedAmountAsString);

    const [selection, setSelection] = useState({
        start: selectedAmountAsString.length,
        end: selectedAmountAsString.length,
    });

    const forwardDeletePressedRef = useRef(false);
    // The ref is used to ignore any onSelectionChange event that happens while we are updating the selection manually in setNewAmount
    const willSelectionBeUpdatedManually = useRef(false);

    /**
     * Sets the selection and the amount accordingly to the value passed to the input
     * @param {String} newAmount - Changed amount from user input
     */
    const setNewAmount = useCallback(
        (newAmount: string) => {
            // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
            // More info: https://github.com/Expensify/App/issues/16974
            const newAmountWithoutSpaces = stripSpacesFromAmount(newAmount);
            const finalAmount = newAmountWithoutSpaces.includes('.') ? stripCommaFromAmount(newAmountWithoutSpaces) : replaceCommasWithPeriod(newAmountWithoutSpaces);
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            if (!validateAmount(finalAmount, decimals)) {
                setSelection((prevSelection) => ({...prevSelection}));
                return;
            }

            // setCurrentAmount contains another setState(setSelection) making it error-prone since it is leading to setSelection being called twice for a single setCurrentAmount call. This solution introducing the hasSelectionBeenSet flag was chosen for its simplicity and lower risk of future errors https://github.com/Expensify/App/issues/23300#issuecomment-1766314724.

            willSelectionBeUpdatedManually.current = true;
            let hasSelectionBeenSet = false;
            const strippedAmount = stripCommaFromAmount(finalAmount);
            amountRef.current = strippedAmount;
            setCurrentAmount((prevAmount) => {
                const isForwardDelete = prevAmount.length > strippedAmount.length && forwardDeletePressedRef.current;
                if (!hasSelectionBeenSet) {
                    hasSelectionBeenSet = true;
                    setSelection((prevSelection) => getNewSelection(prevSelection, isForwardDelete ? strippedAmount.length : prevAmount.length, strippedAmount.length));
                    willSelectionBeUpdatedManually.current = false;
                }
                onAmountChange?.(strippedAmount);
                return strippedAmount;
            });
        },
        [decimals, onAmountChange],
    );

    useImperativeHandle(moneyRequestAmountInputRef, () => ({
        setNewAmount(amountValue: string) {
            setNewAmount(amountValue);
        },
        changeSelection(newSelection: Selection) {
            setSelection(newSelection);
        },
        changeAmount(newAmount: string) {
            setCurrentAmount(newAmount);
        },
        getAmount() {
            return currentAmount;
        },
        getSelection() {
            return selection;
        },
    }));

    useEffect(() => {
        if ((!currency || typeof amount !== 'number' || (formatAmountOnBlur && isTextInputFocused(textInput))) ?? shouldKeepUserInput) {
            return;
        }
        const frontendAmount = onFormatAmount(amount, currency);
        setCurrentAmount(frontendAmount);

        // Only update selection if the amount prop was changed from the outside and is not the same as the current amount we just computed
        // In the line below the currentAmount is not immediately updated, it should still hold the previous value.
        if (frontendAmount !== currentAmount) {
            setSelection({
                start: frontendAmount.length,
                end: frontendAmount.length,
            });
        }

        // we want to re-initialize the state only when the amount changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [amount, shouldKeepUserInput]);

    // Modifies the amount to match the decimals for changed currency.
    useEffect(() => {
        // If the changed currency supports decimals, we can return
        if (validateAmount(currentAmount, decimals)) {
            return;
        }

        // If the changed currency doesn't support decimals, we can strip the decimals
        setNewAmount(stripDecimalsFromAmount(currentAmount));

        // we want to update only when decimals change (setNewAmount also changes when decimals change).
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [setNewAmount]);

    /**
     * Input handler to check for a forward-delete key (or keyboard shortcut) press.
     */
    const textInputKeyPress = ({nativeEvent}: NativeSyntheticEvent<KeyboardEvent>) => {
        const key = nativeEvent?.key.toLowerCase();
        if (isMobileSafari() && key === CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            // Optimistically anticipate forward-delete on iOS Safari (in cases where the Mac accessibility keyboard is being
            // used for input). If the Control-D shortcut doesn't get sent, the ref will still be reset on the next key press.
            forwardDeletePressedRef.current = true;
            return;
        }
        // Control-D on Mac is a keyboard shortcut for forward-delete. See https://support.apple.com/en-us/HT201236 for Mac keyboard shortcuts.
        // Also check for the keyboard shortcut on iOS in cases where a hardware keyboard may be connected to the device.
        const operatingSystem = getOperatingSystem();
        forwardDeletePressedRef.current = key === 'delete' || ((operatingSystem === CONST.OS.MAC_OS || operatingSystem === CONST.OS.IOS) && nativeEvent?.ctrlKey && key === 'd');
    };

    const formatAmount = useCallback(() => {
        if (!formatAmountOnBlur) {
            return;
        }
        const formattedAmount = onFormatAmount(amount, currency);
        if (maxLength && formattedAmount.length > maxLength) {
            return;
        }
        setCurrentAmount(formattedAmount);
        setSelection({
            start: formattedAmount.length,
            end: formattedAmount.length,
        });
    }, [amount, currency, onFormatAmount, formatAmountOnBlur, maxLength]);

    const formattedAmount = replaceAllDigits(currentAmount, toLocaleDigit);

    const {setMouseDown, setMouseUp} = useMouseContext();
    const handleMouseDown = (e: React.MouseEvent<Element, MouseEvent>) => {
        e.stopPropagation();
        setMouseDown();
    };
    const handleMouseUp = (e: React.MouseEvent<Element, MouseEvent>) => {
        e.stopPropagation();
        setMouseUp();
    };

    return (
        <TextInputWithCurrencySymbol
            autoGrow={autoGrow}
            autoGrowExtraSpace={autoGrowExtraSpace}
            disableKeyboard={disableKeyboard}
            formattedAmount={formattedAmount}
            onChangeAmount={setNewAmount}
            onCurrencyButtonPress={onCurrencyButtonPress}
            onBlur={formatAmount}
            placeholder={numberFormat(0)}
            ref={(ref) => {
                if (typeof forwardedRef === 'function') {
                    forwardedRef(ref);
                } else if (forwardedRef?.current) {
                    // eslint-disable-next-line no-param-reassign
                    forwardedRef.current = ref;
                }
                // eslint-disable-next-line react-compiler/react-compiler
                textInput.current = ref;
            }}
            selectedCurrencyCode={currency}
            selection={selection}
            onSelectionChange={(selectionStart, selectionEnd) => {
                if (shouldIgnoreSelectionWhenUpdatedManually && willSelectionBeUpdatedManually.current) {
                    willSelectionBeUpdatedManually.current = false;
                    return;
                }
                if (!shouldUpdateSelection) {
                    return;
                }

                // When the amount is updated in setNewAmount on iOS, in onSelectionChange formattedAmount stores the value before the update. Using amountRef allows us to read the updated value
                const maxSelection = amountRef.current?.length ?? formattedAmount.length;
                amountRef.current = undefined;
                const start = Math.min(selectionStart, maxSelection);
                const end = Math.min(selectionEnd, maxSelection);
                setSelection({start, end});
            }}
            onKeyPress={textInputKeyPress}
            hideCurrencySymbol={hideCurrencySymbol}
            prefixCharacter={prefixCharacter}
            isCurrencyPressable={isCurrencyPressable}
            style={props.inputStyle}
            containerStyle={props.containerStyle}
            prefixStyle={props.prefixStyle}
            prefixContainerStyle={props.prefixContainerStyle}
            touchableInputWrapperStyle={props.touchableInputWrapperStyle}
            maxLength={maxLength}
            hideFocusedState={hideFocusedState}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            contentWidth={contentWidth}
            testID={testID}
            submitBehavior={submitBehavior}
            shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}
            shouldUseDefaultLineHeightForPrefix={shouldUseDefaultLineHeightForPrefix}
        />
    );
}

MoneyRequestAmountInput.displayName = 'MoneyRequestAmountInput';

export default React.forwardRef(MoneyRequestAmountInput);
export type {MoneyRequestAmountInputProps, MoneyRequestAmountInputRef};
