import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useRef} from 'react';
import type {BlurEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import {convertToFrontendAmountAsString, getCurrencyDecimals, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import NumberWithSymbolForm from './NumberWithSymbolForm';
import type {NumberWithSymbolFormRef} from './NumberWithSymbolForm';
import isTextInputFocused from './TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from './TextInput/BaseTextInput/types';
import type {TextInputWithSymbolProps} from './TextInputWithSymbol/types';

type MoneyRequestAmountInputRef = {
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

    /** Style for the input */
    inputStyle?: StyleProp<TextStyle>;

    /** Style for the container */
    containerStyle?: StyleProp<ViewStyle>;

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

    /** Whether the amount is negative */
    isNegative?: boolean;

    /** Function to toggle the amount to negative */
    toggleNegative?: () => void;

    /** Function to clear the negative amount */
    clearNegative?: () => void;

    /** Whether to allow flipping amount */
    allowFlippingAmount?: boolean;

    /** Whether to allow direct negative input (for split amounts where value is already negative) */
    allowNegativeInput?: boolean;

    /** The testID of the input. Used to locate this view in end-to-end tests. */
    testID?: string;

    /** Whether to show the big number pad */
    shouldShowBigNumberPad?: boolean;

    /** Error to display at the bottom of the form */
    errorText?: string;

    /** Footer to display at the bottom of the form */
    footer?: React.ReactNode;

    /** Reference to the amount form */
    moneyRequestAmountInputRef?: ForwardedRef<NumberWithSymbolFormRef>;

    /**
     * Whether to wrap the input in a full width & height container
     * Disable when you only want to display the input alone without `flex: 1` container
     * E.g., Split amount input
     */
    shouldWrapInputInContainer?: boolean;

    /** Whether the input is disabled or not */
    disabled?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<BaseTextInputRef>;
} & Pick<TextInputWithSymbolProps, 'autoGrowExtraSpace' | 'submitBehavior' | 'shouldUseDefaultLineHeightForPrefix' | 'onFocus' | 'onBlur'>;

type Selection = {
    start: number;
    end: number;
};

const defaultOnFormatAmount = (amount: number, currency?: string) => convertToFrontendAmountAsString(amount, currency ?? CONST.CURRENCY.USD);

/**
 * Specialized money amount input with currency and money amount formatting.
 */
function MoneyRequestAmountInput({
    amount = 0,
    currency = CONST.CURRENCY.USD,
    isCurrencyPressable = true,
    onCurrencyButtonPress,
    onAmountChange,
    prefixCharacter = '',
    hideCurrencySymbol = false,
    moneyRequestAmountInputRef,
    disableKeyboard = true,
    onFormatAmount = defaultOnFormatAmount,
    formatAmountOnBlur,
    maxLength,
    hideFocusedState = true,
    shouldKeepUserInput = false,
    shouldShowBigNumberPad = false,
    inputStyle,
    autoGrow = true,
    autoGrowExtraSpace,
    contentWidth,
    testID,
    submitBehavior,
    shouldApplyPaddingToContainer = false,
    shouldUseDefaultLineHeightForPrefix = true,
    shouldWrapInputInContainer = true,
    isNegative = false,
    allowFlippingAmount = false,
    allowNegativeInput = false,
    toggleNegative,
    clearNegative,
    ref,
    disabled,
    ...props
}: MoneyRequestAmountInputProps) {
    const {preferredLocale, translate} = useLocalize();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const numberFormRef = useRef<NumberWithSymbolFormRef | null>(null);
    const decimals = getCurrencyDecimals(currency);

    useEffect(() => {
        if ((!currency || typeof amount !== 'number' || (formatAmountOnBlur && isTextInputFocused(textInput))) ?? shouldKeepUserInput) {
            return;
        }
        const frontendAmount = onFormatAmount(amount, currency);
        // Only update selection if the amount prop was changed from the outside and is not the same as the current amount we just computed
        // In the line below the currentAmount is not immediately updated, it should still hold the previous value.
        if (frontendAmount !== numberFormRef.current?.getNumber()) {
            numberFormRef.current?.updateNumber(frontendAmount);
        }

        // we want to re-initialize the state only when the amount changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amount, shouldKeepUserInput]);

    const formatAmount = useCallback(() => {
        if (!formatAmountOnBlur) {
            return;
        }
        const formattedAmount = onFormatAmount(amount, currency);
        if (maxLength && formattedAmount.length > maxLength) {
            return;
        }
        numberFormRef.current?.updateNumber(formattedAmount);
    }, [amount, currency, onFormatAmount, formatAmountOnBlur, maxLength]);

    const inputOnBlur = (e: BlurEvent) => {
        props.onBlur?.(e);
        formatAmount();
    };

    return (
        <NumberWithSymbolForm
            value={onFormatAmount(amount, currency)}
            decimals={decimals}
            onSymbolButtonPress={onCurrencyButtonPress}
            onInputChange={onAmountChange}
            onBlur={inputOnBlur}
            ref={(newRef) => {
                if (typeof ref === 'function') {
                    ref(newRef);
                } else if (ref?.current) {
                    // eslint-disable-next-line no-param-reassign
                    ref.current = newRef;
                }
                textInput.current = newRef;
            }}
            disabled={disabled}
            numberFormRef={(newRef) => {
                if (typeof moneyRequestAmountInputRef === 'function') {
                    moneyRequestAmountInputRef(newRef);
                } else if (moneyRequestAmountInputRef && 'current' in moneyRequestAmountInputRef) {
                    // eslint-disable-next-line no-param-reassign
                    moneyRequestAmountInputRef.current = newRef;
                }
                numberFormRef.current = newRef;
            }}
            symbol={getLocalizedCurrencySymbol(preferredLocale, currency) ?? ''}
            symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
            currency={currency}
            hideSymbol={hideCurrencySymbol}
            isSymbolPressable={isCurrencyPressable}
            shouldShowBigNumberPad={shouldShowBigNumberPad}
            style={inputStyle}
            autoGrow={autoGrow}
            disableKeyboard={disableKeyboard}
            prefixCharacter={prefixCharacter}
            hideFocusedState={hideFocusedState}
            shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}
            shouldUseDefaultLineHeightForPrefix={shouldUseDefaultLineHeightForPrefix}
            shouldWrapInputInContainer={shouldWrapInputInContainer}
            containerStyle={props.containerStyle}
            prefixStyle={props.prefixStyle}
            prefixContainerStyle={props.prefixContainerStyle}
            touchableInputWrapperStyle={props.touchableInputWrapperStyle}
            contentWidth={contentWidth}
            isNegative={isNegative}
            testID={testID}
            errorText={props.errorText}
            footer={props.footer}
            autoGrowExtraSpace={autoGrowExtraSpace}
            submitBehavior={submitBehavior}
            allowFlippingAmount={allowFlippingAmount}
            allowNegativeInput={allowNegativeInput}
            toggleNegative={toggleNegative}
            clearNegative={clearNegative}
            onFocus={props.onFocus}
            accessibilityLabel={`${translate('iou.amount')} (${currency})`}
        />
    );
}

export default MoneyRequestAmountInput;
export type {MoneyRequestAmountInputProps, MoneyRequestAmountInputRef};
