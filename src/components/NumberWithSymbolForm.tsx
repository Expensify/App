import {useIsFocused} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import type {NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useMouseContext} from '@hooks/useMouseContext';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import getOperatingSystem from '@libs/getOperatingSystem';
import {
    addLeadingZero,
    handleNegativeAmountFlipping,
    replaceAllDigits,
    replaceCommasWithPeriod,
    stripCommaFromAmount,
    stripDecimalsFromAmount,
    stripSpacesFromAmount,
    validateAmount,
} from '@libs/MoneyRequestUtils';
import shouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually';
import CONST from '@src/CONST';
import BigNumberPad from './BigNumberPad';
import Button from './Button';
import FormHelpMessage from './FormHelpMessage';
import ScrollView from './ScrollView';
import TextInput from './TextInput';
import isTextInputFocused from './TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from './TextInput/BaseTextInput/types';
import TextInputWithCurrencySymbol from './TextInputWithSymbol';
import type {TextInputWithSymbolProps} from './TextInputWithSymbol/types';

type NumberWithSymbolFormProps = {
    /** Value to display, should already be formatted */
    value?: string;

    /** Callback to update the value in the FormProvider */
    onInputChange?: (number: string) => void;

    /** Number of decimals to display in the number */
    decimals?: number;

    /** Currency of the input */
    currency?: string;

    /** Whether the big number pad should be shown */
    shouldShowBigNumberPad?: boolean;

    /** Footer to display at the bottom of the form */
    footer?: React.ReactNode;

    /** Reference to the number form */
    numberFormRef?: ForwardedRef<NumberWithSymbolFormRef>;

    /** Error to display at the bottom of the form */
    errorText?: string;

    /** Whether the form should use a standard TextInput as a base */
    displayAsTextInput?: boolean;

    /** Custom label for the TextInput */
    label?: string;

    /** Whether to wrap the input in a container */
    shouldWrapInputInContainer?: boolean;

    /** Whether the amount is negative */
    isNegative?: boolean;

    /** Function to toggle the amount to negative */
    toggleNegative?: () => void;

    /** Function to clear the negative amount */
    clearNegative?: () => void;

    /** Whether to allow flipping amount */
    allowFlippingAmount?: boolean;

    /** Whether the input is disabled or not */
    disabled?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Callback when the user presses the submit key (Enter) */
    onSubmitEditing?: () => void;
} & Omit<TextInputWithSymbolProps, 'formattedAmount' | 'onAmountChange' | 'placeholder' | 'onSelectionChange' | 'onKeyPress' | 'onMouseDown' | 'onMouseUp'>;

type NumberWithSymbolFormRef = {
    clearSelection: () => void;
    updateNumber: (newNumber: string) => void;
    getNumber: () => string;
};

const canUseTouchScreen = canUseTouchScreenUtil();

/**
 * Returns the new selection object based on the updated number's length
 */
const getNewSelection = (oldSelection: {start: number; end: number}, prevLength: number, newLength: number) => {
    const cursorPosition = oldSelection.end + (newLength - prevLength);
    return {start: cursorPosition, end: cursorPosition};
};

const NUMBER_VIEW_ID = 'numberView';
const NUM_PAD_CONTAINER_VIEW_ID = 'numPadContainerView';
const NUM_PAD_VIEW_ID = 'numPadView';

/**
 * Generic number input form with symbol (currency or unit).
 *
 * Can render either a standard TextInput or a number input with BigNumberPad and symbol interaction.
 * Already handles number decimals and input validation.
 */
function NumberWithSymbolForm({
    value: number,
    symbol = '',
    currency = '',
    symbolPosition = CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX,
    hideSymbol = false,
    decimals = 0,
    maxLength,
    errorText,
    onInputChange,
    onSymbolButtonPress,
    isSymbolPressable = true,
    shouldShowBigNumberPad = canUseTouchScreen,
    displayAsTextInput = false,
    footer,
    numberFormRef,
    label,
    style,
    containerStyle,
    symbolTextStyle,
    autoGrow = true,
    disableKeyboard = true,
    prefixCharacter = '',
    hideFocusedState = true,
    shouldApplyPaddingToContainer = false,
    shouldUseDefaultLineHeightForPrefix = true,
    shouldWrapInputInContainer = true,
    isNegative = false,
    allowFlippingAmount = false,
    toggleNegative,
    clearNegative,
    ref,
    disabled,
    onSubmitEditing,
    ...props
}: NumberWithSymbolFormProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'PlusMinus']);
    const styles = useThemeStyles();
    const {toLocaleDigit, numberFormat, translate} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);
    const numberRef = useRef<string | undefined>(undefined);
    const [currentNumber, setCurrentNumber] = useState(typeof number === 'string' ? number : '');

    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);

    const isFocused = useIsFocused();
    const wasFocused = usePrevious(isFocused);

    const [selection, setSelection] = useState({
        start: currentNumber.length,
        end: currentNumber.length,
    });

    const forwardDeletePressedRef = useRef(false);
    // The ref is used to ignore any onSelectionChange event that happens while we are updating the selection manually in setNewNumber
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
     * Sets the selection and the number accordingly to the number passed to the input
     * @param newNumber - Changed number from user input
     */
    const setNewNumber = useCallback(
        (newNumber: string) => {
            // Remove spaces from the newNumber number because Safari on iOS adds spaces when pasting a copied number
            // More info: https://github.com/Expensify/App/issues/16974
            const newNumberWithoutSpaces = stripSpacesFromAmount(newNumber);
            const rawFinalNumber = newNumberWithoutSpaces.includes('.') ? stripCommaFromAmount(newNumberWithoutSpaces) : replaceCommasWithPeriod(newNumberWithoutSpaces);

            const finalNumber = handleNegativeAmountFlipping(rawFinalNumber, allowFlippingAmount, toggleNegative);

            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            if (!validateAmount(finalNumber, decimals, maxLength)) {
                setSelection((prevSelection) => ({...prevSelection}));
                return;
            }

            willSelectionBeUpdatedManually.current = true;
            let hasSelectionBeenSet = false;
            const strippedNumber = stripCommaFromAmount(finalNumber);
            numberRef.current = strippedNumber;
            setCurrentNumber((prevNumber) => {
                const isForwardDelete = prevNumber.length > strippedNumber.length && forwardDeletePressedRef.current;
                if (!hasSelectionBeenSet) {
                    hasSelectionBeenSet = true;
                    setSelection((prevSelection) => getNewSelection(prevSelection, isForwardDelete ? strippedNumber.length : prevNumber.length, strippedNumber.length));
                    willSelectionBeUpdatedManually.current = false;
                }
                return strippedNumber;
            });
            onInputChange?.(strippedNumber);
        },
        [decimals, maxLength, onInputChange, allowFlippingAmount, toggleNegative],
    );

    /**
     * Set a new number number properly formatted, used for the TextInput
     * @param text - Changed text from user input
     */
    const setFormattedNumber = (text: string) => {
        // Remove spaces from the new number because Safari on iOS adds spaces when pasting a copied number
        // More info: https://github.com/Expensify/App/issues/16974
        const newNumberWithoutSpaces = stripSpacesFromAmount(text);
        const replacedCommasNumber = handleNegativeAmountFlipping(replaceCommasWithPeriod(newNumberWithoutSpaces), allowFlippingAmount, toggleNegative);

        const withLeadingZero = addLeadingZero(replacedCommasNumber);

        if (!validateAmount(withLeadingZero, decimals, maxLength)) {
            setSelection((prevSelection) => ({...prevSelection}));
            return;
        }

        const strippedNumber = stripCommaFromAmount(withLeadingZero);
        const isForwardDelete = currentNumber.length > strippedNumber.length && forwardDeletePressedRef.current;
        setCurrentNumber(strippedNumber);
        setSelection(getNewSelection(selection, isForwardDelete ? strippedNumber.length : currentNumber.length, strippedNumber.length));
        onInputChange?.(strippedNumber);
    };

    // Clears text selection if user visits symbol (currency) selector and comes back
    useEffect(() => {
        if (!isFocused || wasFocused) {
            return;
        }
        clearSelection();
    }, [isFocused, wasFocused, clearSelection]);

    // Modifies the number to match changed decimals.
    useEffect(() => {
        // If the number supports decimals, we can return
        if (validateAmount(currentNumber, decimals, maxLength, allowFlippingAmount)) {
            return;
        }

        // If the number doesn't support decimals, we can strip the decimals
        setNewNumber(stripDecimalsFromAmount(currentNumber));

        // we want to update only when decimals change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [decimals]);

    /**
     * Update number with number or Backspace pressed for BigNumberPad.
     * Validate new number with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     */
    const updateValueNumberPad = useCallback(
        (key: string) => {
            if (shouldUpdateSelection && !isTextInputFocused(textInput)) {
                textInput.current?.focus();
            }
            // Backspace button is pressed
            if (key === '<' || key === 'Backspace') {
                if (currentNumber.length > 0) {
                    const selectionStart = selection.start === selection.end ? selection.start - 1 : selection.start;
                    const newNumber = `${currentNumber.substring(0, selectionStart)}${currentNumber.substring(selection.end)}`;
                    setNewNumber(addLeadingZero(newNumber));
                }
                return;
            }
            const newNumber = addLeadingZero(`${currentNumber.substring(0, selection.start)}${key}${currentNumber.substring(selection.end)}`);
            setNewNumber(newNumber);
        },
        [currentNumber, selection.start, selection.end, shouldUpdateSelection, setNewNumber],
    );

    /**
     * Update long press number, to remove items pressing on <
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

        if (!textInput.current?.value && key === 'backspace' && isNegative) {
            clearNegative?.();
        }

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

    useImperativeHandle(numberFormRef, () => ({
        clearSelection,
        updateNumber: (newNumber: string) => {
            const updatedNumber = handleNegativeAmountFlipping(newNumber, allowFlippingAmount, toggleNegative);

            setCurrentNumber(updatedNumber);
            setSelection({start: updatedNumber.length, end: updatedNumber.length});
        },
        getNumber: () => currentNumber,
    }));

    const formattedNumber = replaceAllDigits(currentNumber, toLocaleDigit);

    if (displayAsTextInput) {
        return (
            <TextInput
                label={label}
                accessibilityLabel={label}
                value={formattedNumber}
                onChangeText={setFormattedNumber}
                ref={(newRef: BaseTextInputRef | null) => {
                    if (typeof ref === 'function') {
                        ref(newRef);
                    } else if (ref && 'current' in ref) {
                        // eslint-disable-next-line no-param-reassign
                        ref.current = newRef;
                    }
                }}
                disabled={disabled}
                prefixCharacter={symbol}
                prefixStyle={styles.colorMuted}
                keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
                // See https://github.com/Expensify/App/issues/51868 for more information
                autoCapitalize="words"
                inputMode={CONST.INPUT_MODE.DECIMAL}
                errorText={errorText}
                style={style}
                autoFocus={props.autoFocus}
                autoGrowExtraSpace={props.autoGrowExtraSpace}
                autoGrowMarginSide={props.autoGrowMarginSide}
                onSubmitEditing={onSubmitEditing}
            />
        );
    }

    const textInputComponent = (
        <TextInputWithCurrencySymbol
            formattedAmount={formattedNumber}
            onChangeAmount={setNewNumber}
            onSymbolButtonPress={onSymbolButtonPress}
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
            disabled={disabled}
            symbol={symbol}
            hideSymbol={hideSymbol}
            symbolPosition={symbolPosition}
            selection={selection}
            onSelectionChange={(selectionStart, selectionEnd) => {
                if (shouldIgnoreSelectionWhenUpdatedManually && willSelectionBeUpdatedManually.current) {
                    willSelectionBeUpdatedManually.current = false;
                    return;
                }
                if (!shouldUpdateSelection) {
                    return;
                }
                // When the number is updated in setNewNumber on iOS, in onSelectionChange formattedNumber stores the number before the update. Using numberRef allows us to read the updated number
                const maxSelection = numberRef.current?.length ?? formattedNumber.length;
                numberRef.current = undefined;
                const start = Math.min(selectionStart, maxSelection);
                const end = Math.min(selectionEnd, maxSelection);
                setSelection({start, end});
            }}
            onKeyPress={textInputKeyPress}
            isSymbolPressable={isSymbolPressable && !shouldWrapInputInContainer}
            symbolTextStyle={symbolTextStyle}
            style={style}
            containerStyle={containerStyle}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            autoFocus={props.autoFocus}
            autoGrow={autoGrow}
            disableKeyboard={disableKeyboard}
            prefixCharacter={prefixCharacter}
            hideFocusedState={hideFocusedState}
            shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}
            shouldUseDefaultLineHeightForPrefix={shouldUseDefaultLineHeightForPrefix}
            autoGrowExtraSpace={props.autoGrowExtraSpace}
            autoGrowMarginSide={props.autoGrowMarginSide}
            contentWidth={props.contentWidth}
            onPress={props.onPress}
            onBlur={props.onBlur}
            submitBehavior={props.submitBehavior}
            testID={props.testID}
            prefixStyle={props.prefixStyle}
            prefixContainerStyle={props.prefixContainerStyle}
            touchableInputWrapperStyle={props.touchableInputWrapperStyle}
            isNegative={isNegative}
            toggleNegative={toggleNegative}
            onFocus={props.onFocus}
            accessibilityLabel={props.accessibilityLabel ?? `${translate('iou.amount')} ${formattedNumber} (${currency})`}
        />
    );

    return (
        <ScrollView
            contentContainerStyle={styles.flexGrow1}
            style={!shouldWrapInputInContainer && styles.flexGrow0}
        >
            {shouldWrapInputInContainer ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <View
                        id={NUMBER_VIEW_ID}
                        onMouseDown={(event) => focusTextInput(event, [NUMBER_VIEW_ID])}
                        style={[styles.flex1, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
                    >
                        <View style={[styles.flexRow, styles.moneyRequestAmountContainer, styles.alignItemsCenter, styles.justifyContentCenter]}>{textInputComponent}</View>
                        {isSymbolPressable && !!currency && !canUseTouchScreen && (
                            <Button
                                shouldShowRightIcon
                                small
                                iconRight={icons.DownArrow}
                                onPress={onSymbolButtonPress}
                                style={styles.minWidth18}
                                isContentCentered
                                text={currency}
                            />
                        )}
                        {!!errorText && (
                            <FormHelpMessage
                                style={[styles.pAbsolute, styles.b0, shouldShowBigNumberPad ? styles.mb5 : styles.mb3, styles.ph5, styles.w100]}
                                isError
                                message={errorText}
                            />
                        )}
                    </View>
                </View>
            ) : (
                textInputComponent
            )}

            <View style={[styles.flexRow, styles.justifyContentCenter, shouldShowBigNumberPad ? styles.mb2 : styles.mb0, styles.gap2]}>
                {isSymbolPressable && canUseTouchScreen && (
                    <Button
                        shouldShowRightIcon
                        small
                        iconRight={icons.DownArrow}
                        onPress={onSymbolButtonPress}
                        style={styles.minWidth18}
                        isContentCentered
                        text={currency}
                    />
                )}
                {allowFlippingAmount && canUseTouchScreen && (
                    <Button
                        shouldShowRightIcon
                        small
                        iconRight={icons.PlusMinus}
                        onPress={toggleNegative}
                        style={styles.minWidth18}
                        isContentCentered
                        text={translate('iou.flip')}
                    />
                )}
            </View>

            {shouldShowBigNumberPad || !!footer ? (
                <View
                    onMouseDown={(event) => focusTextInput(event, [NUM_PAD_CONTAINER_VIEW_ID, NUM_PAD_VIEW_ID])}
                    style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pt0]}
                    id={NUM_PAD_CONTAINER_VIEW_ID}
                >
                    {shouldShowBigNumberPad ? (
                        <BigNumberPad
                            id={NUM_PAD_VIEW_ID}
                            numberPressed={updateValueNumberPad}
                            longPressHandlerStateChanged={updateLongPressHandlerState}
                        />
                    ) : null}
                    {footer}
                </View>
            ) : null}
        </ScrollView>
    );
}

export default NumberWithSymbolForm;
export type {NumberWithSymbolFormProps, NumberWithSymbolFormRef};
