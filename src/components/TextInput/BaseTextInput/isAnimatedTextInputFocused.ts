import type {AnimatedTextInputRef} from '@components/RNTextInput';
import type {BaseTextInputRef} from './types';

export default function isAnimatedTextInputFocused(textInput: React.MutableRefObject<BaseTextInputRef | null>): boolean | null {
    return textInput.current && 'isFocused' in textInput.current && (textInput.current as AnimatedTextInputRef).isFocused();
}
