import type SetCursorPosition from './types';

const setCursorPosition: SetCursorPosition = (position, ref, setSelection) => {
    setSelection({
        start: position,
        end: position,
    });
    ref.current?.focus();
};

export default setCursorPosition;
