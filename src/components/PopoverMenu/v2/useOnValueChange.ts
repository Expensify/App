import {useState} from 'react';

/** Fires `onChange` during the render where `value` first differs from prev. See https://react.dev/reference/react/useState#storing-information-from-previous-renders. */
function useOnValueChange<T>(value: T, onChange: (next: T, prev: T) => void): void {
    const [prev, setPrev] = useState(value);
    if (!Object.is(prev, value)) {
        setPrev(value);
        onChange(value, prev);
    }
}

export default useOnValueChange;
