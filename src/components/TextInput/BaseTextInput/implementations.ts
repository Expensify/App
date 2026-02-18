import RNMarkdownTextInput from '@components/RNMarkdownTextInput';
import RNMaskedTextInput from '@components/RNMaskedTextInput';
import RNTextInput from '@components/RNTextInput';
import type {BaseTextInputProps, InputType} from './types';

type InputComponentType = React.ComponentType<BaseTextInputProps>;

const InputComponentMap = new Map<InputType, InputComponentType>([
    ['default', RNTextInput as InputComponentType],
    ['mask', RNMaskedTextInput as InputComponentType],
    ['markdown', RNMarkdownTextInput as InputComponentType],
]);

export default InputComponentMap;
