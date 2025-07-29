import {useIsFocused} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import {useMouseContext} from '@hooks/useMouseContext';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import {canUseTouchScreen as canUseTouchScreenCheck} from '@libs/DeviceCapabilities';
import getOperatingSystem from '@libs/getOperatingSystem';
import {addLeadingZero, replaceAllDigits, replaceCommasWithPeriod, stripCommaFromAmount, stripDecimalsFromAmount, stripSpacesFromAmount, validateAmount} from '@libs/MoneyRequestUtils';
import shouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually';
import CONST from '@src/CONST';
import BigNumberPad from './BigNumberPad';
import FormHelpMessage from './FormHelpMessage';
import TextInput from './TextInput';
import isTextInputFocused from './TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from './TextInput/BaseTextInput/types';
import TextInputWithCurrencySymbol from './TextInputWithSymbol';
import type {TextInputWithSymbolProps} from './TextInputWithSymbol/types';

type NumberWithSymbolFormProps = {
    /** Amount to display, should already be formatted */
    value?: string;

    /** Callback to update the amount in the FormProvider */
    onInputChange?: (value: string) => void;

    /** Number of decimals to display in the amount */
    decimals?: number;

    /** Whether the big number pad should be shown */
    shouldShowBigNumberPad?: boolean;

    /** Footer to display at the bottom of the form */
    footer?: React.ReactNode;

    /** Reference to the amount form */
    amountFormRef?: ForwardedRef<NumberWithSymbolFormRef>;

    /** Error to display at the bottom of the form */
    errorText?: string;

    /** Whether the form should use a standard TextInput as a base */
    displayAsTextInput?: boolean;

    /** Custom label for the TextInput */
    label?: string;
} & Omit<TextInputWithSymbolProps, 'formattedAmount' | 'onAmountChange' | 'placeholder' | 'onSelectionChange' | 'onKeyPress' | 'onMouseDown' | 'onMouseUp'>;

type NumberWithSymbolFormRef = {
    clearSelection: () => void;
    updateAmount: (newAmount: string) => void;
    getAmount: () => string;
};

/**
 * Returns the new selection object based on the updated amount's length
 */
const getNewSelection = (oldSelection: {start: number; end: number}, prevLength: number, newLength: number) => {
    const cursorPosition = oldSelection.end + (newLength - prevLength);
    return {start: cursorPosition, end: cursorPosition};
};

const AMOUNT_VIEW_ID = 'amountView';
const NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
const NUM_PAD_VIEW_ID = 'numPadView';

function NumberWithSymbolForm(
    {
        value: amount,
        symbol = '',
        decimals = 0,
        maxLength,
        errorText,
        onInputChange,
        onSymbolButtonPress,
        isSymbolPressable = true,
        shouldShowBigNumberPad = false,
        displayAsTextInput = false,
        footer,
        amountFormRef,
        label,
        ...props
    }: NumberWithSymbolFormProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {toLocaleDigit, numberFormat} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);
    const amountRef = useRef<string | undefined>(undefined);
    const [currentAmount, setCurrentAmount] = useState(typeof amount === 'string' ? amount : '');

    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);

    const isFocused = useIsFocused();
    const wasFocused = usePrevious(isFocused);

    const [selection, setSelection] = useState({
        start: currentAmount.length,
        end: currentAmount.length,
    });

    const forwardDeletePressedRef = useRef(false);
    // The ref is used to ignore any onSelectionChange event that happens while we are updating the selection manually in setNewAmount
    const willSelectionBeUpdatedManually = useRef(false);

    const {setMouseDown, setMouseUp} = useMouseContext();
    const handleMouseDown = (e: React.MouseEvent<Element, MouseEvent>) => {
        e.stopPropagation();
        setMouseDown();
    };
    const handleMouseUp = (e: React.MouseEvent<Element, MouseEvent>) => {
        e.stopPropagation();
        setMouseUp();
    };

    const clearSelection = useCallback(() => {
        setSelection({start: selection.end, end: selection.end});
    }, [selection.end]);

    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     */
    const focusTextInput = (event: React.MouseEvent, ids: string[]) => {
        const relatedTargetId = (event.nativeEvent?.target as HTMLElement)?.id;
        if (!ids.includes(relatedTargetId)) {
            return;
        }

        event.preventDefault();
        clearSelection();

        if (!textInput.current) {
            return;
        }
        if (!isTextInputFocused(textInput)) {
            textInput.current.focus();
        }
    };

    /**
     * Sets the selection and the amount accordingly to the value passed to the input
     * @param newAmount - Changed amount from user input
     */
    const setNewAmount = useCallback(
        (newAmount: string) => {
            // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
            // More info: https://github.com/Expensify/App/issues/16974
            const newAmountWithoutSpaces = stripSpacesFromAmount(newAmount);
            const finalAmount = newAmountWithoutSpaces.includes('.') ? stripCommaFromAmount(newAmountWithoutSpaces) : replaceCommasWithPeriod(newAmountWithoutSpaces);
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            if (!validateAmount(finalAmount, decimals, maxLength)) {
                setSelection((prevSelection) => ({...prevSelection}));
                return;
            }

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
                onInputChange?.(strippedAmount);
                return strippedAmount;
            });
        },
        [decimals, maxLength, onInputChange],
    );

    /**
     * Set a new amount value properly formatted, used for the TextInput
     * @param text - Changed text from user input
     */
    const setFormattedAmount = (text: string) => {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        const newAmountWithoutSpaces = stripSpacesFromAmount(text);
        const replacedCommasAmount = replaceCommasWithPeriod(newAmountWithoutSpaces);
        const withLeadingZero = addLeadingZero(replacedCommasAmount);

        if (!validateAmount(withLeadingZero, decimals, maxLength)) {
            setSelection((prevSelection) => ({...prevSelection}));
            return;
        }

        const strippedAmount = stripCommaFromAmount(withLeadingZero);
        const isForwardDelete = currentAmount.length > strippedAmount.length && forwardDeletePressedRef.current;
        setSelection(getNewSelection(selection, isForwardDelete ? strippedAmount.length : currentAmount.length, strippedAmount.length));
        onInputChange?.(strippedAmount);
    };

    // Clears text selection if user visits symbol (currency) selector and comes back
    useEffect(() => {
        if (!isFocused || wasFocused) {
            return;
        }
        clearSelection();
    }, [isFocused, wasFocused, clearSelection]);

    // Modifies the amount to match changed decimals.
    useEffect(() => {
        // If the amount supports decimals, we can return
        if (validateAmount(currentAmount, decimals, maxLength)) {
            return;
        }

        // If the amount doesn't support decimals, we can strip the decimals
        setNewAmount(stripDecimalsFromAmount(currentAmount));

        // we want to update only when decimals change.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [decimals]);

    /**
     * Update amount with number or Backspace pressed for BigNumberPad.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     */
    const updateAmountNumberPad = useCallback(
        (key: string) => {
            if (shouldUpdateSelection && !isTextInputFocused(textInput)) {
                textInput.current?.focus();
            }
            // Backspace button is pressed
            if (key === '<' || key === 'Backspace') {
                if (currentAmount.length > 0) {
                    const selectionStart = selection.start === selection.end ? selection.start - 1 : selection.start;
                    const newAmount = `${currentAmount.substring(0, selectionStart)}${currentAmount.substring(selection.end)}`;
                    setNewAmount(addLeadingZero(newAmount));
                }
                return;
            }
            const newAmount = addLeadingZero(`${currentAmount.substring(0, selection.start)}${key}${currentAmount.substring(selection.end)}`);
            setNewAmount(newAmount);
        },
        [currentAmount, selection, shouldUpdateSelection, setNewAmount],
    );

    /**
     * Update long press value, to remove items pressing on <
     *
     * @param value - Changed text from user input
     */
    const updateLongPressHandlerState = useCallback((value: boolean) => {
        setShouldUpdateSelection(!value);
        if (!value && !isTextInputFocused(textInput)) {
            textInput.current?.focus();
        }
    }, []);

    /**
     * Input handler to check for a forward-delete key (or keyboard shortcut) press.
     */
    const textInputKeyPress = (event: NativeSyntheticEvent<KeyboardEvent>) => {
        const key = event.nativeEvent.key.toLowerCase();
        if (isMobileSafari() && key === CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            // Optimistically anticipate forward-delete on iOS Safari (in cases where the Mac Accessibility keyboard is being
            // used for input). If the Control-D shortcut doesn't get sent, the ref will still be reset on the next key press.
            forwardDeletePressedRef.current = true;
            return;
        }
        // Control-D on Mac is a keyboard shortcut for forward-delete. See https://support.apple.com/en-us/HT201236 for Mac keyboard shortcuts.
        // Also check for the keyboard shortcut on iOS in cases where a hardware keyboard may be connected to the device.
        const operatingSystem = getOperatingSystem() as string | null;
        const allowedOS: string[] = [CONST.OS.MAC_OS, CONST.OS.IOS];
        forwardDeletePressedRef.current = key === 'delete' || (allowedOS.includes(operatingSystem ?? '') && event.nativeEvent.ctrlKey && key === 'd');
    };

    useImperativeHandle(amountFormRef, () => ({
        clearSelection,
        updateAmount: (newAmount: string) => {
            setCurrentAmount(newAmount);
            setSelection({start: newAmount.length, end: newAmount.length});
        },
        getAmount: () => currentAmount,
    }));

    const formattedAmount = replaceAllDigits(currentAmount, toLocaleDigit);
    const canUseTouchScreen = canUseTouchScreenCheck();

    if (displayAsTextInput) {
        return (
            <TextInput
                label={label}
                accessibilityLabel={label}
                value={formattedAmount}
                onChangeText={setFormattedAmount}
                ref={(ref: BaseTextInputRef) => {
                    if (typeof forwardedRef === 'function') {
                        forwardedRef(ref);
                    } else if (forwardedRef && 'current' in forwardedRef) {
                        // eslint-disable-next-line no-param-reassign
                        forwardedRef.current = ref;
                    }
                }}
                prefixCharacter={symbol}
                prefixStyle={styles.colorMuted}
                keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
                // See https://github.com/Expensify/App/issues/51868 for more information
                autoCapitalize="words"
                inputMode={CONST.INPUT_MODE.DECIMAL}
                errorText={errorText}
                autoFocus={props.autoFocus}
                autoGrowExtraSpace={props.autoGrowExtraSpace}
                autoGrowMarginSide={props.autoGrowMarginSide}
                style={props.style}
            />
        );
    }

    return (
        <>
            <View
                id={AMOUNT_VIEW_ID}
                onMouseDown={(event) => focusTextInput(event, [AMOUNT_VIEW_ID])}
                style={[styles.moneyRequestAmountContainer, styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
            >
                <TextInputWithCurrencySymbol
                    formattedAmount={formattedAmount}
                    onChangeAmount={setNewAmount}
                    onSymbolButtonPress={onSymbolButtonPress}
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
                    symbol={symbol}
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
                    isSymbolPressable={isSymbolPressable}
                    style={[styles.iouAmountTextInput]}
                    containerStyle={[styles.iouAmountTextInputContainer]}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
                {!!errorText && (
                    <FormHelpMessage
                        style={[styles.pAbsolute, styles.b0, canUseTouchScreen ? styles.mb0 : styles.mb3, styles.ph5, styles.w100]}
                        isError
                        message={errorText}
                    />
                )}
            </View>
            {shouldShowBigNumberPad || !!footer ? (
                <View
                    onMouseDown={(event) => focusTextInput(event, [NUM_PAD_CONTAINER_VIEW_ID, NUM_PAD_VIEW_ID])}
                    style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pt0]}
                    id={NUM_PAD_CONTAINER_VIEW_ID}
                >
                    {canUseTouchScreen ? (
                        <BigNumberPad
                            id={NUM_PAD_VIEW_ID}
                            numberPressed={updateAmountNumberPad}
                            longPressHandlerStateChanged={updateLongPressHandlerState}
                        />
                    ) : null}
                    {footer}
                </View>
            ) : null}
        </>
    );
}

NumberWithSymbolForm.displayName = 'NumberWithSymbolForm';

export default forwardRef(NumberWithSymbolForm);
export type {NumberWithSymbolFormProps, NumberWithSymbolFormRef};
