import RNMarkdownTextInput from '@components/RNMarkdownTextInput';
import RNMaskedTextInput from '@components/RNMaskedTextInput';
import RNTextInput from '@components/RNTextInput';

import type {InputType} from './types';

type InputComponentType = typeof RNTextInput | typeof RNMaskedTextInput | typeof RNMarkdownTextInput;

const InputComponentMap = new Map<InputType, InputComponentType>([
    ['default', RNTextInput],
    ['mask', RNMaskedTextInput],
    ['markdown', RNMarkdownTextInput],
]);

export default InputComponentMap;
