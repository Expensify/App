/**
 * NumericField – a composable field for editing numeric values.
 *
 * The root component owns the canonical value, the selection, validation, and
 * the input callbacks through a root-instantiated edit controller. Compose the
 * input presentation as a child:
 *
 * @example
 * ```tsx
 * import NumericField from '@components/NumericField';
 *
 * <NumericField
 *   value={amount}
 *   onInputChange={setAmount}
 *   decimals={2}
 *   allowNegative
 *   errorText={error}
 * >
 *   <NumericField.TextInput
 *     symbol="$"
 *     label="Amount"
 *   />
 * </NumericField>
 * ```
 *
 * The `useNumericFieldState` and `useNumericFieldActions` hooks are also exported
 * for custom composed primitives.
 */
import NumericFieldComponent from './NumericField';
import NumericTextInput from './primitives/NumericTextInput';

const NumericField = Object.assign(NumericFieldComponent, {
    /** Renders a numeric input using the standard text input component. */
    TextInput: NumericTextInput,
});

export default NumericField;
export {useNumericFieldActions, useNumericFieldState} from './context';
export type {NumericFieldRef, NumericTextInputProps} from './types';
