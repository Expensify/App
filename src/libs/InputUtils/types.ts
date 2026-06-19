import type {TextInput} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

type ScrollInput = (input: HTMLInputElement | TextInput | BaseTextInputRef) => void;
type MoveSelectionToEnd = (input: HTMLInputElement | TextInput | BaseTextInputRef) => void;

export type {ScrollInput, MoveSelectionToEnd};
