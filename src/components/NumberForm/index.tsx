import NumberFormComponent from './NumberForm';
import NumberFormSymbolInput from './primitives/NumberFormSymbolInput';
import NumberFormTextInput from './primitives/NumberFormTextInput';

const NumberForm = Object.assign(NumberFormComponent, {
    SymbolInput: NumberFormSymbolInput,
    TextInput: NumberFormTextInput,
});

export default NumberForm;
export {useNumberFormActions, useNumberFormState} from './context';
export type {NumberFormProps, NumberFormRef, NumberFormSymbolInputProps, NumberFormTextInputProps} from './types';
