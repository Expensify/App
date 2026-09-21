import type {ComponentRef, RefObject} from 'react';
import type {TextInput} from 'react-native';

type SetCursorPosition = (position: number, ref: RefObject<ComponentRef<typeof TextInput> | null>, setSelection: (value: {start: number; end: number}) => void) => void;

export default SetCursorPosition;
