// setSelection.ts
import {RefObject} from 'react';
import {TextInput} from 'react-native';

const setSelection = (value: {start: number; end: number}, ref: RefObject<TextInput>, setSelectionCallback: (value: {start: number; end: number}) => void): (() => void) => {
    ref.current?.focus();

    const timer = setTimeout(() => {
        setSelectionCallback(value);
    }, 10);

    // Return the cleanup function
    return () => {
        clearTimeout(timer);
    };
};

export default setSelection;
