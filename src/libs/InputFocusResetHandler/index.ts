import type InputFocusResetHandler from './types';

const inputFocusResetHandler: InputFocusResetHandler = {
    handleInputFocusReset: (inputRef, shouldResetFocusRef) => {
        if (!inputRef.current || !shouldResetFocusRef.current) {
            return;
        }

        inputRef?.current?.focus();
        const resetFocusRef = shouldResetFocusRef;
        resetFocusRef.current = false;
    },
};

export default inputFocusResetHandler;
