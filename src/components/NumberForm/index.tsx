/**
 * NumberForm – a composable form for editing numeric values.
 *
 * The root component owns the canonical value, the selection, validation, and
 * the input callbacks through a root-instantiated edit controller. Compose the
 * input presentation as a child:
 *
 * @example
 * ```tsx
 * import NumberForm from '@components/NumberForm';
 *
 * <NumberForm
 *   value={amount}
 *   onInputChange={setAmount}
 *   decimals={2}
 *   allowNegative
 *   errorText={error}
 * >
 *   <NumberForm.TextInput
 *     symbol="$"
 *     position="prefix"
 *     label="Amount"
 *   />
 * </NumberForm>
 * ```
 *
 * The `useNumberFormState` and `useNumberFormActions` hooks are also exported
 * for custom composed primitives, and `useNumberEditController` is exported for
 * other roots (NumberComposer) that own the same editing behavior.
 */
import NumberFormComponent from './NumberForm';
import NumberFormTextInput from './primitives/NumberFormTextInput';

const NumberForm = Object.assign(NumberFormComponent, {
    /** Renders a numeric input using the standard text input component. */
    TextInput: NumberFormTextInput,
});

export default NumberForm;
export {useNumberFormActions, useNumberFormState} from './context';
export {default as useNumberEditController} from './hooks/useNumberEditController';
export type {NumberFormRef, NumberFormTextInputProps} from './types';
