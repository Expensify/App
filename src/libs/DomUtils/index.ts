import {BlurActiveElement, GetActiveElement} from './types';

const blurActiveElement: BlurActiveElement = () => {
    const activeElement = document.activeElement as HTMLElement;

    if (!activeElement?.blur) {
        return;
    }

    activeElement.blur();
};

const getActiveElement: GetActiveElement = () => document.activeElement;

export default {
    blurActiveElement,
    getActiveElement,
};
