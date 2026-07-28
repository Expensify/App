import type SetCursorPosition from './types';

const setCursorPosition: SetCursorPosition = (position, ref, setSelection) => {
    const selection = {
        start: position,
        end: position,
    };
    setSelection(selection);
    ref.current?.focus();
    ref.current?.setNativeProps({selection});
};

export default setCursorPosition;
