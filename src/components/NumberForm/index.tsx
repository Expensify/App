import NumberFormComponent from './NumberForm';
import NumberFormSymbolInput from './primitives/NumberFormSymbolInput';
import NumberFormTextInput from './primitives/NumberFormTextInput';

const NumberForm = Object.assign(NumberFormComponent, {
    SymbolInput: NumberFormSymbolInput,
    TextInput: NumberFormTextInput,
});

export default NumberForm;
export {useNumberFormContext} from './context';
export type {
    NumberFormInputBaseProps,
    NumberFormInputKeyPressEvent,
    NumberFormInputPosition,
    NumberFormNegativeMode,
    NumberFormProps,
    NumberFormRef,
    NumberFormSymbolInputProps,
    NumberFormTextInputProps,
} from './types';
