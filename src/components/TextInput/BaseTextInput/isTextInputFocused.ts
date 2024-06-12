import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type {BaseTextInputRef} from './types';

/** Checks that text input has the isFocused method and is focused. */
export default function isTextInputFocused(textInput: React.MutableRefObject<BaseTextInputRef | null>): boolean | null {
    return textInput.current && 'isFocused' in textInput.current && (textInput.current as AnimatedTextInputRef).isFocused();
}
