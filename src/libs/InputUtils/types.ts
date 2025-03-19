import type {TextInput} from 'react-native';

type ScrollInput = (input: HTMLInputElement | TextInput) => void;
type MoveSelectionToEnd = (input: HTMLInputElement | TextInput) => void;

export type {ScrollInput, MoveSelectionToEnd};
