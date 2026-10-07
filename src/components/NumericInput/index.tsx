import {NumericCurrencyButton} from '@components/NumericButtons';

import NumericInputComponent from './NumericInput';
import NumericFlipButton from './primitives/NumericFlipButton';
import NumericSymbol from './primitives/NumericSymbol';
import NumericTextInput from './primitives/NumericTextInput';

/**
 * NumericInput is the full-screen numeric editor: an amount (or percentage, distance, hours) filling the screen, with the
 * touch number pad and the submit button below it. Inline form fields use NumericField instead.
 *
 * The root owns the canonical signed value, the selection, and validation through the same editing controller as
 * NumericField, and renders the whole screen layout: one scrollable column, or two columns on phones in landscape. Its
 * children are only the amount row, in display order; the input displays the magnitude and the root renders the minus sign
 * before the row, the error, the number pad (touch screens only), `actions` and `footer`.
 *
 * @example
 * ```tsx
 * import NumericInput from '@components/NumericInput';
 *
 * <NumericInput
 *   value={amount}
 *   onInputChange={setAmount}
 *   decimals={2}
 *   allowNegative
 *   errorText={errorText}
 *   actions={
 *     <>
 *       <NumericInput.CurrencyButton currency={currency} onPress={openCurrencyPicker} />
 *       <NumericInput.FlipButton />
 *     </>
 *   }
 *   footer={<Button text="Next" onPress={handleSubmit} />}
 * >
 *   <NumericInput.Symbol>$</NumericInput.Symbol>
 *   <NumericInput.TextInput />
 * </NumericInput>
 * ```
 */
const NumericInput = Object.assign(NumericInputComponent, {
    /** Opens the currency selector. */
    CurrencyButton: NumericCurrencyButton,

    /** Toggles the sign of the value. Renders only on touch screens, when the root allows negative values. */
    FlipButton: NumericFlipButton,

    /** Renders its children as the symbol (currency or unit) displayed beside the number. */
    Symbol: NumericSymbol,

    /** Renders the number itself, displaying and editing the magnitude of the canonical value. */
    TextInput: NumericTextInput,
});

export default NumericInput;
export {useNumericInputActions} from './context';
