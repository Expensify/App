import type GetActiveElement from './types';
import type {DomUtils} from './types';

const getActiveElement: GetActiveElement = () => null;

const addCSS = () => {};

const getAutofilledInputStyle = () => '';

const requestAnimationFrame = (callback: () => void) => {
    if (!callback) {
        return;
    }

    callback();
};

const domUtils: DomUtils = {
    addCSS,
    getAutofilledInputStyle,
    getActiveElement,
    requestAnimationFrame,
};

export default domUtils;
