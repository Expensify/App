import type {AmountEditingRef} from '@components/AmountEditingController';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {ForwardedRef} from 'react';

/** Props shared by both amount form adapters */
type AmountFormBaseProps = {
    /** Amount supplied by the FormProvider */
    value?: string;

    /**
     * ISO currency code of the amount, not the currency symbol
     * e.g. "USD", "EUR", "GBP", not "$", "€", "£"
     */
    currency?: string;

    /** Error to display at the bottom of the component */
    errorText?: string;

    /** Callback to update the amount in the FormProvider */
    onInputChange?: (value: string) => void;

    /** Custom max amount length. It defaults to CONST.IOU.AMOUNT_MAX_LENGTH */
    amountMaxLength?: number;

    /** Overrides the decimals of the currency */
    decimals?: number;

    hideCurrencySymbol?: boolean;

    /** Forwarded to the text input, so FormProvider can focus the field. Use `numberFormRef` to read or update the amount */
    ref?: ForwardedRef<BaseTextInputRef>;

    /** Reference to the number form for imperative updates */
    numberFormRef?: ForwardedRef<AmountEditingRef>;

    onSubmitEditing?: () => void;

    onFocus?: () => void;
} & Pick<BaseTextInputProps, 'autoFocus' | 'onBlur'>;

type AmountFormInlineProps = AmountFormBaseProps & {
    /** Label of the text input, also used as its accessibility label */
    label?: string;

    /** Disables both the input and the trailing dropdown */
    disabled?: boolean;

    /** When true, shows the trailing dropdown (same as currency picker in IOU amount flows) */
    shouldShowCurrencyButton?: boolean;

    /** Text on the trailing dropdown button. Use with `shouldShowCurrencyButton` when the suffix is not a currency code (e.g. duration unit). */
    currencyButtonLabel?: string;

    /** Accessibility label for the trailing dropdown */
    currencyButtonAccessibilityLabel?: string;

    onCurrencyButtonPress?: () => void;
};

type AmountFormKeypadProps = AmountFormBaseProps;

export type {AmountFormInlineProps, AmountFormKeypadProps};
