/**
 * NumericInput – a composable numeric editing experience for symbol and number-pad interactions.
 *
 * The root owns the canonical value, the selection, and validation through the same root-instantiated
 * edit controller as NumericField. Primitives are placed by the composition, in the order and layout it wants.
 *
 * @example
 * ```tsx
 * import NumericInput from '@components/NumericInput';
 *
 * <NumericInput
 *   value={amount}
 *   onInputChange={setAmount}
 *   decimals={2}
 * >
 *   <NumericInput.Container>
 *     <NumericInput.Symbol>$</NumericInput.Symbol>
 *     <NumericInput.TextInput />
 *   </NumericInput.Container>
 * </NumericInput>
 * ```
 *
 */
import NumericInputComponent from './NumericInput';
import NumericInputContainer from './primitives/NumericInputContainer';
import NumericSymbol from './primitives/NumericSymbol';
import NumericSymbolButton from './primitives/NumericSymbolButton';
import NumericTextInput from './primitives/NumericTextInput';

const NumericInput = Object.assign(NumericInputComponent, {
    /** Renders the number itself, displaying and editing the magnitude of the canonical value. */
    TextInput: NumericTextInput,

    /** Renders its children as the symbol (currency or unit) displayed beside the number. */
    Symbol: NumericSymbol,

    /** Renders a pressable symbol (currency or unit) selector. */
    SymbolButton: NumericSymbolButton,

    /** Renders the centered, full-size amount layout with legacy empty-area refocus behavior. */
    Container: NumericInputContainer,
});

export default NumericInput;
