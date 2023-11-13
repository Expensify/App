import {RefObject} from 'react';
import {TextInput} from 'react-native';

export default function setSelection(value: {start: number; end: number}, ref: RefObject<TextInput>) {
    ref.current?.focus();
    ref.current?.setNativeProps({selection: value});
    return () => {};
}
