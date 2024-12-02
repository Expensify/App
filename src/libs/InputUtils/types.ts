import type {TextInput} from 'react-native';

type ScrollInput = (input: HTMLInputElement | TextInput) => void;
type MoveSelectiontoEnd = (input: HTMLInputElement | TextInput) => void;

export type {ScrollInput, MoveSelectiontoEnd};
