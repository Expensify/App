import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {TextInput} from 'react-native';

type UpdateMultilineInputRange = (input: HTMLInputElement | BaseTextInputRef | TextInput | null, shouldAutoFocus?: boolean) => void;

export default UpdateMultilineInputRange;
