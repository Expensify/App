import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useRef} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
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
} & Pick<TextInputWithSymbolProps, 'autoGrowExtraSpace' | 'submitBehavior' | 'shouldUseDefaultLineHeightForPrefix'>;

type Selection = {
    start: number;
    end: number;
};

const defaultOnFormatAmount = (amount: number, currency?: string) => convertToFrontendAmountAsString(amount, currency ?? CONST.CURRENCY.USD);

/**
 * Specialized money amount input with currency and money amount formatting.
 */
function MoneyRequestAmountInput(
    {
        amount = 0,
        currency = CONST.CURRENCY.USD,
        isCurrencyPressable = true,
        onCurrencyButtonPress,
        onAmountChange,
        hideCurrencySymbol = false,
        onFormatAmount = defaultOnFormatAmount,
        formatAmountOnBlur,
        shouldKeepUserInput = false,
        maxLength,
        moneyRequestAmountInputRef,
        shouldShowBigNumberPad = false,
        inputStyle,
        shouldUseDefaultLineHeightForPrefix = true,
        ...props
    }: MoneyRequestAmountInputProps,
    forwardedRef: ForwardedRef<BaseTextInputRef>,
) {
    const textInput = useRef<BaseTextInputRef | null>(null);
    const amountFormRef = useRef<NumberWithSymbolFormRef | null>(null);
    const decimals = getCurrencyDecimals(currency);

    useEffect(() => {
        if ((!currency || typeof amount !== 'number' || (formatAmountOnBlur && isTextInputFocused(textInput))) ?? shouldKeepUserInput) {
            return;
        }
        const frontendAmount = onFormatAmount(amount, currency);
        // Only update selection if the amount prop was changed from the outside and is not the same as the current amount we just computed
        // In the line below the currentAmount is not immediately updated, it should still hold the previous value.
        if (frontendAmount !== amountFormRef.current?.getAmount()) {
            amountFormRef.current?.updateAmount(frontendAmount);
        }

        // we want to re-initialize the state only when the amount changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [amount, shouldKeepUserInput]);

    const formatAmount = useCallback(() => {
        if (!formatAmountOnBlur) {
            return;
        }
        const formattedAmount = onFormatAmount(amount, currency);
        if (maxLength && formattedAmount.length > maxLength) {
            return;
        }
        amountFormRef.current?.updateAmount(formattedAmount);
    }, [amount, currency, onFormatAmount, formatAmountOnBlur, maxLength]);

    return (
        <NumberWithSymbolForm
            value={onFormatAmount(amount, currency)}
            decimals={decimals}
            onSymbolButtonPress={onCurrencyButtonPress}
            onInputChange={onAmountChange}
            onBlur={formatAmount}
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
            amountFormRef={(ref) => {
                if (typeof moneyRequestAmountInputRef === 'function') {
                    moneyRequestAmountInputRef(ref);
                } else if (moneyRequestAmountInputRef && 'current' in moneyRequestAmountInputRef) {
                    // eslint-disable-next-line react-compiler/react-compiler, no-param-reassign
                    moneyRequestAmountInputRef.current = ref;
                }
                amountFormRef.current = ref;
            }}
            symbol={getLocalizedCurrencySymbol(currency) ?? ''}
            symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
            hideSymbol={hideCurrencySymbol}
            isSymbolPressable={isCurrencyPressable}
            shouldShowBigNumberPad={shouldShowBigNumberPad}
            style={inputStyle}
            shouldUseDefaultLineHeightForPrefix={shouldUseDefaultLineHeightForPrefix}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

MoneyRequestAmountInput.displayName = 'MoneyRequestAmountInput';

export default React.forwardRef(MoneyRequestAmountInput);
export type {MoneyRequestAmountInputProps, MoneyRequestAmountInputRef};
