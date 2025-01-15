import RNMarkdownTextInput from '@components/RNMarkdownTextInput';
import RNMaskedTextInput from '@components/RNMaskedTextInput';
import RNTextInput from '@components/RNTextInput';

const InputComponentMap = new Map([
    ['default', RNTextInput],
    ['mask', RNMaskedTextInput],
    ['markdown', RNMarkdownTextInput],
]);

export default InputComponentMap;
