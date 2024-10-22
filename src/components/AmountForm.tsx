import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getOperatingSystem from '@libs/getOperatingSystem';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import CONST from '@src/CONST';
import BigNumberPad from './BigNumberPad';
import FormHelpMessage from './FormHelpMessage';
import TextInput from './TextInput';
import isTextInputFocused from './TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputProps, BaseTextInputRef} from './TextInput/BaseTextInput/types';
import TextInputWithCurrencySymbol from './TextInputWithCurrencySymbol';
import type TextInputWithCurrencySymbolProps from './TextInputWithCurrencySymbol/types';

type AmountFormProps = {
    /** Amount supplied by the FormProvider */
    value?: string;

    /** Currency supplied by user */
    currency?: string;

    /** Tells how many extra decimal digits are allowed. Default is 0. */
    extraDecimals?: number;

    /** Error to display at the bottom of the component */
    errorText?: string;

    /** Callback to update the amount in the FormProvider */
    onInputChange?: (value: string) => void;

    /** Fired when back button pressed, navigates to currency selection page */
    onCurrencyButtonPress?: () => void;

    /** Whether the currency symbol is pressable */
    isCurrencyPressable?: boolean;

    /** Custom max amount length. It defaults to CONST.IOU.AMOUNT_MAX_LENGTH */
    amountMaxLength?: number;

    /** Custom label for the TextInput */
    label?: string;

    /** Whether the form should use a standard TextInput as a base */
    displayAsTextInput?: boolean;

    /** Number of decimals to display */
    fixedDecimals?: number;
} & Pick<TextInputWithCurrencySymbolProps, 'hideCurrencySymbol' | 'extraSymbol'> &
    Pick<BaseTextInputProps, 'autoFocus'>;

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

function AmountForm(
    {
        value: amount,
        currency = CONST.CURRENCY.USD,
        extraDecimals = 0,
        amountMaxLength,
        errorText,
        onInputChange,
        onCurrencyButtonPress,
        displayAsTextInput = false,
        isCurrencyPressable = true,
        label,
        fixedDecimals,
        ...rest
    }: AmountFormProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {toLocaleDigit, numberFormat} = useLocalize();

    const textInput = useRef<BaseTextInputRef | null>(null);

    const decimals = fixedDecimals ?? CurrencyUtils.getCurrencyDecimals(currency) + extraDecimals;
    const currentAmount = useMemo(() => (typeof amount === 'string' ? amount : ''), [amount]);

    const [shouldUpdateSelection, setShouldUpdateSelection] = useState(true);

    const [selection, setSelection] = useState({
        start: currentAmount.length,
        end: currentAmount.length,
    });

    const forwardDeletePressedRef = useRef(false);

    /**
     * Event occurs when a user presses a mouse button over an DOM element.
     */
    const focusTextInput = (event: React.MouseEvent, ids: string[]) => {
        const relatedTargetId = (event.nativeEvent?.target as HTMLElement | null)?.id ?? '';
        if (!ids.includes(relatedTargetId)) {
            return;
        }

        event.preventDefault();
        setSelection({
            start: selection.end,
            end: selection.end,
        });

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
            const newAmountWithoutSpaces = MoneyRequestUtils.stripSpacesFromAmount(newAmount);
            // Use a shallow copy of selection to trigger setSelection
            // More info: https://github.com/Expensify/App/issues/16385
            if (!MoneyRequestUtils.validateAmount(newAmountWithoutSpaces, decimals, amountMaxLength)) {
                setSelection((prevSelection) => ({...prevSelection}));
                return;
            }

            const strippedAmount = MoneyRequestUtils.stripCommaFromAmount(newAmountWithoutSpaces);
            const isForwardDelete = currentAmount.length > strippedAmount.length && forwardDeletePressedRef.current;
            setSelection(getNewSelection(selection, isForwardDelete ? strippedAmount.length : currentAmount.length, strippedAmount.length));
            onInputChange?.(strippedAmount);
        },
        [amountMaxLength, currentAmount, decimals, onInputChange, selection],
    );

    /**
     * Set a new amount value properly formatted
     *
     * @param text - Changed text from user input
     */
    const setFormattedAmount = (text: string) => {
        // Remove spaces from the newAmount value because Safari on iOS adds spaces when pasting a copied value
        // More info: https://github.com/Expensify/App/issues/16974
        const newAmountWithoutSpaces = MoneyRequestUtils.stripSpacesFromAmount(text);
        const replacedCommasAmount = MoneyRequestUtils.replaceCommasWithPeriod(newAmountWithoutSpaces);
        const withLeadingZero = MoneyRequestUtils.addLeadingZero(replacedCommasAmount);

        if (!MoneyRequestUtils.validateAmount(withLeadingZero, decimals, amountMaxLength)) {
            setSelection((prevSelection) => ({...prevSelection}));
            return;
        }

        const strippedAmount = MoneyRequestUtils.stripCommaFromAmount(withLeadingZero);
        const isForwardDelete = currentAmount.length > strippedAmount.length && forwardDeletePressedRef.current;
        setSelection(getNewSelection(selection, isForwardDelete ? strippedAmount.length : currentAmount.length, strippedAmount.length));
        onInputChange?.(strippedAmount);
    };

    // Modifies the amount to match the decimals for changed currency.
    useEffect(() => {
        // If the changed currency supports decimals, we can return
        if (MoneyRequestUtils.validateAmount(currentAmount, decimals, amountMaxLength)) {
            return;
        }

        // If the changed currency doesn't support decimals, we can strip the decimals
        setNewAmount(MoneyRequestUtils.stripDecimalsFromAmount(currentAmount));

        // we want to update only when decimals change (setNewAmount also changes when decimals change).
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
                    setNewAmount(MoneyRequestUtils.addLeadingZero(newAmount));
                }
                return;
            }
            const newAmount = MoneyRequestUtils.addLeadingZero(`${currentAmount.substring(0, selection.start)}${key}${currentAmount.substring(selection.end)}`);
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
        if (Browser.isMobileSafari() && key === CONST.PLATFORM_SPECIFIC_KEYS.CTRL.DEFAULT) {
            // Optimistically anticipate forward-delete on iOS Safari (in cases where the Mac Accessiblity keyboard is being
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

    const formattedAmount = MoneyRequestUtils.replaceAllDigits(currentAmount, toLocaleDigit);
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    if (displayAsTextInput) {
        return (
            <TextInput
                label={label}
                value={formattedAmount}
                onChangeText={setFormattedAmount}
                ref={(ref: BaseTextInputRef) => {
                    if (typeof forwardedRef === 'function') {
                        forwardedRef(ref);
                    } else if (forwardedRef && 'current' in forwardedRef) {
                        // eslint-disable-next-line no-param-reassign
                        forwardedRef.current = ref;
                    }
                    textInput.current = ref;
                }}
                prefixCharacter={currency}
                prefixStyle={styles.colorMuted}
                keyboardType={CONST.KEYBOARD_TYPE.DECIMAL_PAD}
                inputMode={CONST.INPUT_MODE.DECIMAL}
                errorText={errorText}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
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
                    onCurrencyButtonPress={onCurrencyButtonPress}
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
                    selectedCurrencyCode={currency}
                    selection={selection}
                    onSelectionChange={(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
                        if (!shouldUpdateSelection) {
                            return;
                        }
                        setSelection(e.nativeEvent.selection);
                    }}
                    onKeyPress={textInputKeyPress}
                    isCurrencyPressable={isCurrencyPressable}
                    style={[styles.iouAmountTextInput]}
                    containerStyle={[styles.iouAmountTextInputContainer]}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                />
                {!!errorText && (
                    <FormHelpMessage
                        style={[styles.pAbsolute, styles.b0, canUseTouchScreen ? styles.mb0 : styles.mb3, styles.ph5, styles.w100]}
                        isError
                        message={errorText}
                    />
                )}
            </View>
            {canUseTouchScreen ? (
                <View
                    onMouseDown={(event) => focusTextInput(event, [NUM_PAD_CONTAINER_VIEW_ID, NUM_PAD_VIEW_ID])}
                    style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pt0]}
                    id={NUM_PAD_CONTAINER_VIEW_ID}
                >
                    <BigNumberPad
                        id={NUM_PAD_VIEW_ID}
                        numberPressed={updateAmountNumberPad}
                        longPressHandlerStateChanged={updateLongPressHandlerState}
                    />
                </View>
            ) : null}
        </>
    );
}

AmountForm.displayName = 'AmountForm';

export default forwardRef(AmountForm);
export type {AmountFormProps};
