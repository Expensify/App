import {AmountCurrencyPickerButton} from '@components/AmountActionButtons';

import KeypadAmountEditorComponent from './KeypadAmountEditor';
import KeypadAmountInput from './primitives/KeypadAmountInput';
import KeypadAmountSignFlipButton from './primitives/KeypadAmountSignFlipButton';
import KeypadAmountSymbol from './primitives/KeypadAmountSymbol';

/**
 * KeypadAmountEditor is the full-screen amount editor: an amount (or percentage, distance, hours) filling the screen, with the
 * touch number pad and the submit button below it. Inline form fields use AmountFormField instead.
 *
 * The root owns the canonical signed value, the selection, and validation through the editing controller,
 * and renders the whole screen layout: one scrollable column, or two columns on phones in landscape. Its
 * children are only the amount row, in display order. The input displays the magnitude and the root renders the minus sign
 * before the row, the error, the number pad (touch screens only), `actions` and `footer`.
 *
 * @example
 * ```tsx
 * import KeypadAmountEditor from '@components/KeypadAmountEditor';
 *
 * <KeypadAmountEditor
 *   value={amount}
 *   onInputChange={setAmount}
 *   decimals={2}
 *   allowNegative
 *   errorText={errorText}
 *   actions={
 *     <>
 *       <KeypadAmountEditor.CurrencyPickerButton currency={currency} onPress={openCurrencyPicker} />
 *       <KeypadAmountEditor.SignFlipButton />
 *     </>
 *   }
 *   footer={<Button text="Next" onPress={handleSubmit} />}
 * >
 *   <KeypadAmountEditor.Symbol>$</KeypadAmountEditor.Symbol>
 *   <KeypadAmountEditor.Input />
 * </KeypadAmountEditor>
 * ```
 */
const KeypadAmountEditor = Object.assign(KeypadAmountEditorComponent, {
    /** Opens the currency selector. */
    CurrencyPickerButton: AmountCurrencyPickerButton,

    /** Toggles the sign of the value. Renders only on touch screens, when the root allows negative values. */
    SignFlipButton: KeypadAmountSignFlipButton,

    /** Renders its children as the symbol (currency or unit) beside the number, counting them in the dynamic font size. */
    Symbol: KeypadAmountSymbol,

    /** Renders the number itself, displaying and editing the magnitude of the canonical value. */
    Input: KeypadAmountInput,
});

export default KeypadAmountEditor;
export {useKeypadAmountEditorActions} from './context';
