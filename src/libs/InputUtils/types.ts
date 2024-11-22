import type {TextInput} from 'react-native';

type ScrollToBottom = (input: HTMLInputElement | TextInput) => void;
type MoveSelectiontoEnd = (input: HTMLInputElement | TextInput) => void;

export type {ScrollToBottom, MoveSelectiontoEnd};
