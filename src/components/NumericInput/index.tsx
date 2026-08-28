/**
 * NumericInput – a composable numeric editing experience for symbol and
 * number-pad interactions.
 *
 * The root owns the canonical signed value, the selection, validation, and the
 * sign, through the same root-instantiated edit controller as NumericField. The
 * composed input displays only the magnitude; the minus is rendered separately.
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
 *   <NumericInput.SymbolInput
 *     symbol="$"
 *     position="prefix"
 *   />
 *   <NumericInput.Error />
 * </NumericInput>
 * ```
 *
 * The error is rendered by its own primitive rather than by the input, because the number-pad layouts position it
 * differently. The `useNumericInputActions` hook is also exported for custom composed primitives. The number pad,
 * layouts, controls, and footer primitives arrive in a later PR.
 */
import NumericInputComponent from './NumericInput';
import NumericError from './primitives/NumericError';
import NumericSymbolInput from './primitives/NumericSymbolInput';

const NumericInput = Object.assign(NumericInputComponent, {
    /** Renders a numeric input with a symbol beside it and a separately rendered minus. */
    SymbolInput: NumericSymbolInput,

    /** Renders the root error, positioned by the composition that places it. */
    Error: NumericError,
});

export default NumericInput;
export {useNumericInputActions, useNumericInputState} from './context';
export type {NumericInputProps} from './NumericInput';
export type {NumericInputRef, NumericSymbolInputProps} from './types';
