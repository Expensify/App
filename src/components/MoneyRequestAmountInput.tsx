import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import {getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';

import type {ForwardedRef} from 'react';
import type {BlurEvent, KeyboardTypeOptions, StyleProp, TextStyle, ViewStyle} from 'react-native';

import React, {useCallback, useEffect, useRef} from 'react';

import type {NumberWithSymbolFormRef} from './NumberWithSymbolForm';
import type {BaseTextInputRef} from './TextInput/BaseTextInput/types';
import type {TextInputWithSymbolProps} from './TextInputWithSymbol/types';

import NumberWithSymbolForm from './NumberWithSymbolForm';
import isTextInputFocused from './TextInput/BaseTextInput/isTextInputFocused';

type MoneyRequestAmountInputProps = {
    /** IOU amount saved in Onyx */
    amount?: number;

    onFormatAmount: (amount: number, currency?: string) => string;

    /** Currency chosen by user or saved in Onyx */
    currency?: string;

    /** Whether the currency symbol is pressable */
    isCurrencyPressable?: boolean;

    /** Fired when back button pressed, navigates to currency selection page */
    onCurrencyButtonPress?: () => void;

    onAmountChange?: (amount: string) => void;
    inputStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;

    /** Character to be shown before the amount */
    prefixCharacter?: string;

    hideCurrencySymbol?: boolean;

    /** Whether to disable native keyboard on mobile */
    disableKeyboard?: boolean;

    prefixStyle?: StyleProp<TextStyle>;
    prefixContainerStyle?: StyleProp<ViewStyle>;
    touchableInputWrapperStyle?: StyleProp<ViewStyle>;
    formatAmountOnBlur?: boolean;
    maxLength?: number;

    /** Hide the focus styles on TextInput */
    hideFocusedState?: boolean;

    /** Whether the user input should be kept or not */
    shouldKeepUserInput?: boolean;

    /**
     * Auto grow input container length based on the entered text.
     */
    autoGrow?: boolean;

    contentWidth?: number;

    /** Whether to apply padding to the input, some inputs doesn't require any padding, e.g. Amount input in money request flow */
    shouldApplyPaddingToContainer?: boolean;

    isNegative?: boolean;
    toggleNegative?: () => void;
    clearNegative?: () => void;

    /** Whether to allow flipping amount (shows flip button and enables toggle mechanism) */
    allowFlippingAmount?: boolean;

    /** Whether to allow direct negative input (for split amounts where value is already negative) */
    allowNegativeInput?: boolean;

    negativeSymbolStyle?: StyleProp<TextStyle>;

    /** The testID of the input. Used to locate this view in end-to-end tests. */
    testID?: string;

    shouldShowBigNumberPad?: boolean;
    shouldUseDynamicFontSize?: boolean;

    /** Error to display at the bottom of the form */
    errorText?: string;

    /** Footer to display at the bottom of the form */
    footer?: React.ReactNode;

    moneyRequestAmountInputRef?: ForwardedRef<NumberWithSymbolFormRef>;

    /**
     * Whether to wrap the input in a full width & height container
     * Disable when you only want to display the input alone without `flex: 1` container
     * E.g., Split amount input
     */
    shouldWrapInputInContainer?: boolean;

    /** Style applied to the outer ScrollView inside NumberWithSymbolForm */
    scrollViewStyle?: StyleProp<ViewStyle>;

    /**
     * Whether to refocus the input when clicking on the ScrollView empty space.
     * Prevents focus loss when clicking empty space left of the right-aligned input.
     */
    shouldRefocusOnScrollViewClick?: boolean;

    disabled?: boolean;
    ref?: ForwardedRef<BaseTextInputRef>;
    keyboardType?: KeyboardTypeOptions;
} & Pick<TextInputWithSymbolProps, 'autoGrowExtraSpace' | 'submitBehavior' | 'shouldUseDefaultLineHeightForPrefix' | 'onFocus' | 'onBlur' | 'symbolTextStyle'>;

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
    onFormatAmount,
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
    scrollViewStyle,
    shouldRefocusOnScrollViewClick = false,
    isNegative = false,
    allowFlippingAmount = false,
    allowNegativeInput = false,
    negativeSymbolStyle,
    toggleNegative,
    clearNegative,
    ref,
    disabled,
    shouldUseDynamicFontSize = false,
    ...props
}: MoneyRequestAmountInputProps) {
    const {preferredLocale, translate} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
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
            symbolTextStyle={props.symbolTextStyle}
            shouldShowBigNumberPad={shouldShowBigNumberPad}
            style={inputStyle}
            autoGrow={autoGrow}
            disableKeyboard={disableKeyboard}
            prefixCharacter={prefixCharacter}
            hideFocusedState={hideFocusedState}
            shouldApplyPaddingToContainer={shouldApplyPaddingToContainer}
            shouldUseDefaultLineHeightForPrefix={shouldUseDefaultLineHeightForPrefix}
            shouldWrapInputInContainer={shouldWrapInputInContainer}
            scrollViewStyle={scrollViewStyle}
            shouldRefocusOnScrollViewClick={shouldRefocusOnScrollViewClick}
            containerStyle={props.containerStyle}
            prefixStyle={props.prefixStyle}
            prefixContainerStyle={props.prefixContainerStyle}
            touchableInputWrapperStyle={props.touchableInputWrapperStyle}
            contentWidth={contentWidth}
            isNegative={isNegative}
            negativeSymbolStyle={negativeSymbolStyle}
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
            keyboardType={props.keyboardType}
            shouldUseDynamicFontSize={shouldUseDynamicFontSize}
        />
    );
}

export default MoneyRequestAmountInput;
export type {MoneyRequestAmountInputProps};
