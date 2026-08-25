/**
 * NumberComposer – a composable numeric editing experience for symbol and
 * number-pad interactions.
 *
 * The root owns the canonical signed value, the selection, validation, and the
 * sign, through the same root-instantiated edit controller as NumberForm. The
 * composed input displays only the magnitude; the minus is rendered separately.
 *
 * @example
 * ```tsx
 * import NumberComposer from '@components/NumberComposer';
 *
 * <NumberComposer
 *   value={amount}
 *   onInputChange={setAmount}
 *   decimals={2}
 *   allowNegative
 * >
 *   <NumberComposer.SymbolInput
 *     symbol="$"
 *     position="prefix"
 *   />
 * </NumberComposer>
 * ```
 *
 * The `useNumberComposerActions` hook is also exported for custom composed
 * primitives. The number pad, layouts, controls,
 * error, and footer primitives arrive in a later PR.
 */
import NumberComposerComponent from './NumberComposer';
import NumberComposerSymbolInput from './primitives/NumberComposerSymbolInput';

const NumberComposer = Object.assign(NumberComposerComponent, {
    /** Renders a numeric input with a symbol beside it and a separately rendered minus. */
    SymbolInput: NumberComposerSymbolInput,
});

export default NumberComposer;
export {useNumberComposerActions} from './context';
export type {NumberComposerRef, NumberComposerSymbolInputProps} from './types';
