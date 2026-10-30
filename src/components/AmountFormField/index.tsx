import {AmountCurrencyPickerButton} from '@components/AmountActionButtons';

import AmountFormFieldComponent from './AmountFormField';
import AmountFormFieldInput from './primitives/AmountFormFieldInput';
import AmountFormFieldSignFlipButton from './primitives/AmountFormFieldSignFlipButton';

/**
 * AmountFormField – a composable field for editing amount values in forms.
 * For standard Onyx Form integration, use `AmountForm` instead.
 *
 * The root component owns the canonical value, the selection, validation, and
 * the input callbacks through a root-instantiated edit controller. Compose the
 * input presentation as a child:
 *
 * @example
 * ```tsx
 * import AmountFormField from '@components/AmountFormField';
 *
 * <AmountFormField
 *   value={amount}
 *   onInputChange={setAmount}
 *   decimals={2}
 *   allowNegative
 *   errorText={error}
 * >
 *   <AmountFormField.Input
 *     prefixCharacter="$"
 *     label="Amount"
 *   />
 * </AmountFormField>
 * ```
 *
 * The `useAmountFormFieldState` and `useAmountFormFieldActions` hooks are also exported
 * for custom composed primitives.
 */
const AmountFormField = Object.assign(AmountFormFieldComponent, {
    /** Opens the currency selector. */
    CurrencyPickerButton: AmountCurrencyPickerButton,

    /** Toggles the sign of the value. Renders only on touch screens, when the root allows negative values. */
    SignFlipButton: AmountFormFieldSignFlipButton,

    /** Renders an amount input using the standard text input component. */
    Input: AmountFormFieldInput,
});

export default AmountFormField;
export {useAmountFormFieldActions, useAmountFormFieldState} from './context';
export type {AmountFormFieldInputProps, AmountFormFieldRef} from './types';
