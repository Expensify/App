import type {TextInput} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

type UpdateMultilineInputRange = (input: HTMLInputElement | BaseTextInputRef | TextInput | null, shouldAutoFocus?: boolean) => void;

export default UpdateMultilineInputRange;
