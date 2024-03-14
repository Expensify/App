import type {TextInput} from 'react-native';

type FocusTextInputAfterAnimation = (inputRef: TextInput | HTMLInputElement | undefined, animationLength: number) => void;

export default FocusTextInputAfterAnimation;
