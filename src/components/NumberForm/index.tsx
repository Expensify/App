import NumberFormComponent from './NumberForm';
import NumberFormInput from './primitives/NumberFormInput';

const NumberForm = Object.assign(NumberFormComponent, {Input: NumberFormInput});

export default NumberForm;
export {useNumberFormContext} from './context';
export type {NumberFormInputKeyPressEvent, NumberFormInputPosition, NumberFormInputProps, NumberFormNegativeMode, NumberFormProps, NumberFormRef} from './types';
