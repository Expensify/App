import KeypadAmountEditor from '@components/KeypadAmountEditor';

import CONST from '@src/CONST';

import type {AmountFormKeypadProps} from './types';

import useAmountFormCurrency from './useAmountFormCurrency';

/**
 * FormProvider adapter that renders the amount with the number pad.
 */
function AmountFormKeypad({
    value,
    currency = CONST.CURRENCY.USD,
    amountMaxLength,
    errorText,
    onInputChange,
    decimals: decimalsProp,
    hideCurrencySymbol = false,
    autoFocus,
    onSubmitEditing,
    onFocus,
    onBlur,
    ref,
    numberFormRef,
}: AmountFormKeypadProps) {
    const {decimals, symbol} = useAmountFormCurrency(currency, decimalsProp);

    return (
        <KeypadAmountEditor
            ref={numberFormRef}
            value={value ?? ''}
            onInputChange={onInputChange}
            decimals={decimals}
            maxLength={amountMaxLength}
            errorText={errorText}
            // A parent (FormWrapper, or ScreenWrapper on screens without edge-to-edge) already applies the bottom safe area around this editor
            addBottomSafeAreaPadding={false}
        >
            {!hideCurrencySymbol && !!symbol && <KeypadAmountEditor.Symbol>{symbol}</KeypadAmountEditor.Symbol>}
            <KeypadAmountEditor.Input
                ref={ref}
                // The editor input defaults to extra auto-grow space this form does not need
                autoGrowExtraSpace={0}
                autoFocus={autoFocus}
                onFocus={onFocus}
                onBlur={onBlur}
                onSubmitEditing={onSubmitEditing}
            />
        </KeypadAmountEditor>
    );
}

export default AmountFormKeypad;
export type {AmountFormKeypadProps};
