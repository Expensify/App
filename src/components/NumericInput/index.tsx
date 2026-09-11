import NumericCurrencyButton from '@components/NumericButtons/NumericCurrencyButton';

import NumericInputComponent from './NumericInput';
import NumericError from './primitives/NumericError';
import NumericFlipButton from './primitives/NumericFlipButton';
import NumericInputContainer from './primitives/NumericInputContainer';
import NumericMinusSign from './primitives/NumericMinusSign';
import NumericSymbol from './primitives/NumericSymbol';
import NumericSymbolButton from './primitives/NumericSymbolButton';
import NumericTextInput from './primitives/NumericTextInput';

/**
 * NumericInput is a composable numeric editing experience for symbol and number-pad interactions.
 *
 * The root owns the canonical signed value, the selection, and validation through the same root-instantiated
 * edit controller as NumericField. The composed input displays only the magnitude. The sign and symbol are
 * primitives placed by the composition, in the order and layout it wants.
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
 * >
 *   <NumericInput.Container>
 *     <NumericInput.MinusSign />
 *     <NumericInput.Symbol>$</NumericInput.Symbol>
 *     <NumericInput.TextInput />
 *   </NumericInput.Container>
 *   <NumericInput.Error />
 * </NumericInput>
 * ```
 *
 * A suffix symbol is the same composition with the symbol placed after the input. The error is rendered by its own
 * primitive because number-pad layouts position it differently. A composition that needs shared dynamic sizing can
 * read `useNumericDynamicFontSize` once and pass the resulting style to its rendered primitives.
 */

const NumericInput = Object.assign(NumericInputComponent, {
    /** Opens the currency selector. */
    CurrencyButton: NumericCurrencyButton,

    /** Toggles the sign of the value. Renders only when the root allows negative values. */
    FlipButton: NumericFlipButton,

    /** Renders the number itself, displaying and editing the magnitude of the canonical value. */
    TextInput: NumericTextInput,

    /** Renders its children as the symbol (currency or unit) displayed beside the number. */
    Symbol: NumericSymbol,

    /** Renders a pressable symbol (currency or unit) selector. */
    SymbolButton: NumericSymbolButton,

    /** Renders the minus sign of a negative value, which the input itself does not display. */
    MinusSign: NumericMinusSign,

    /** Renders the root error, positioned by the composition. */
    Error: NumericError,

    /** Renders the centered, full-size amount layout with legacy empty-area refocus behavior. */
    Container: NumericInputContainer,
});

export default NumericInput;
export {useNumericInputActions} from './context';
export {default as useNumericDynamicFontSize} from './hooks/useNumericDynamicFontSize';
