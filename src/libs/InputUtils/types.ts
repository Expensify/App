import type {ComponentRef} from 'react';
import type {TextInput} from 'react-native';

type ScrollInput = (input: HTMLInputElement | ComponentRef<typeof TextInput>) => void;
type MoveSelectionToEnd = (input: HTMLInputElement | ComponentRef<typeof TextInput>) => void;

export type {ScrollInput, MoveSelectionToEnd};
