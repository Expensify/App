import type {RefObject} from 'react';
import type {TextInput} from 'react-native';

type SetCursorPosition = (position: number, ref: RefObject<TextInput>, setSelection: (value: {start: number; end: number}) => void) => void;

export default SetCursorPosition;
