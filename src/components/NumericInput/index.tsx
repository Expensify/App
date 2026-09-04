/**
 * NumericInput – a composable numeric editing experience for symbol and
 * number-pad interactions.
 *
 * The root owns the canonical value, the selection, and validation through the
 * same root-instantiated edit controller as NumericField. The symbol is a
 * primitive the composition places itself, in the order it wants and inside the
 * row it lays out.
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
 *   <View style={[styles.flexRow, styles.alignItemsCenter]}>
 *     <NumericInput.Symbol>$</NumericInput.Symbol>
 *     <NumericInput.TextInput />
 *   </View>
 * </NumericInput>
 * ```
 *
 * A suffix symbol is the same composition with the symbol placed after the input. The `Container` primitive provides the
 * centered full-size amount layout when a composition needs the
 * legacy empty-area refocus behavior. The number pad, controls, and footer primitives arrive in a later PR.
 */
import NumericInputComponent from './NumericInput';
import NumericInputContainer from './primitives/NumericInputContainer';
import NumericSymbol from './primitives/NumericSymbol';
import NumericTextInput from './primitives/NumericTextInput';

const NumericInput = Object.assign(NumericInputComponent, {
    /** Renders the number itself, displaying and editing the magnitude of the canonical value. */
    TextInput: NumericTextInput,

    /** Renders its children as the symbol (currency or unit) displayed beside the number. */
    Symbol: NumericSymbol,

    /** Renders the centered, full-size amount layout with legacy empty-area refocus behavior. */
    Container: NumericInputContainer,
});

export default NumericInput;
