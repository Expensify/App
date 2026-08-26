import type GetActiveElement from './types';

const getActiveElement: GetActiveElement = () => null;

const addCSS = (_css?: string, _styleId?: string) => {};

const getAutofilledInputStyle = (_inputTextColor?: string, _cssSelector?: string) => '';

const requestAnimationFrame = (callback: () => void) => {
    if (!callback) {
        return;
    }

    callback();
};

export default {
    addCSS,
    getAutofilledInputStyle,
    getActiveElement,
    requestAnimationFrame,
};
