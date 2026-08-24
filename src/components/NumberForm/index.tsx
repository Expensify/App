/**
 * NumberForm – a composable form for editing numeric values.
 *
 * The root component owns the shared numeric value, validation state, and
 * input callbacks. Choose an input presentation by composing one of its
 * primitives as a child:
 *
 * @example
 * ```tsx
 * import NumberForm from '@components/NumberForm';
 *
 * <NumberForm
 *   value={amount}
 *   onInputChange={setAmount}
 *   allowNegative
 *   errorText={error}
 * >
 *   <NumberForm.TextInput
 *     symbol="$"
 *     decimals={2}
 *     position="prefix"
 *     label="Amount"
 *   />
 * </NumberForm>
 * ```
 *
 * Use `NumberForm.SymbolInput` when the symbol needs its own presentation or
 * interaction. The `useNumberFormState` and `useNumberFormActions` hooks are
 * also exported for custom composed primitives.
 */
import NumberFormComponent from './NumberForm';
import NumberFormSymbolInput from './primitives/NumberFormSymbolInput';
import NumberFormTextInput from './primitives/NumberFormTextInput';

const NumberForm = Object.assign(NumberFormComponent, {
    /** Renders a numeric input with a symbol beside it. */
    SymbolInput: NumberFormSymbolInput,

    /** Renders a numeric input using the standard text input component. */
    TextInput: NumberFormTextInput,
});

export default NumberForm;
export {useNumberFormActions, useNumberFormState} from './context';
export type {NumberFormRef, NumberFormSymbolInputProps, NumberFormTextInputProps} from './types';
