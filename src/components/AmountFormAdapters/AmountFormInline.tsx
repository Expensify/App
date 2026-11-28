import AmountFormField from '@components/AmountFormField';

import CONST from '@src/CONST';

import type {AmountFormInlineProps} from './types';

import useAmountFormCurrency from './useAmountFormCurrency';

/**
 * FormProvider adapter that renders the amount as a text input inside a form row.
 * It also works without a FormProvider, when the caller passes `value` and `onInputChange` itself.
 */
function AmountFormInline({
    value,
    currency = CONST.CURRENCY.USD,
    amountMaxLength,
    errorText,
    onInputChange,
    onCurrencyButtonPress,
    label,
    decimals: decimalsProp,
    hideCurrencySymbol = false,
    shouldShowCurrencyButton = false,
    currencyButtonLabel,
    currencyButtonAccessibilityLabel,
    disabled = false,
    autoFocus,
    onSubmitEditing,
    onFocus,
    onBlur,
    ref,
    numberFormRef,
}: AmountFormInlineProps) {
    const {decimals, symbol} = useAmountFormCurrency(currency, decimalsProp);
    const currencyButtonText = currencyButtonLabel ?? currency;

    return (
        <AmountFormField
            value={value ?? ''}
            onInputChange={onInputChange}
            decimals={decimals}
            maxLength={amountMaxLength}
            errorText={errorText}
            ref={numberFormRef}
        >
            <AmountFormField.Input
                prefixCharacter={hideCurrencySymbol ? '' : symbol}
                accessibilityLabel={label}
                label={label}
                disabled={disabled}
                autoFocus={autoFocus}
                onFocus={onFocus}
                onBlur={onBlur}
                onSubmitEditing={onSubmitEditing}
                ref={ref}
            >
                {shouldShowCurrencyButton && !!currencyButtonText && (
                    <AmountFormField.CurrencyPickerButton
                        currency={currencyButtonText}
                        accessibilityLabel={currencyButtonAccessibilityLabel}
                        onPress={onCurrencyButtonPress}
                        isDisabled={disabled}
                    />
                )}
            </AmountFormField.Input>
        </AmountFormField>
    );
}

export default AmountFormInline;
export type {AmountFormInlineProps};
