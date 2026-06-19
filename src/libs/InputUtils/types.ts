import type {TextInput} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

type ScrollInput = (input: TextInput | BaseTextInputRef) => void;
type MoveSelectionToEnd = (input: TextInput | BaseTextInputRef) => void;

export type {ScrollInput, MoveSelectionToEnd};
