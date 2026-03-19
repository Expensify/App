import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import CONST from '@src/CONST';
import type BlurActiveInputElement from './types';

const blurActiveInputElement: BlurActiveInputElement = () => {
    const activeElement = document.activeElement;

    if (!(activeElement instanceof HTMLElement)) {
        return;
    }

    if (activeElement.tagName !== CONST.ELEMENT_NAME.INPUT && activeElement.tagName !== CONST.ELEMENT_NAME.TEXTAREA) {
        return;
    }

    blurActiveElement();
};

export default blurActiveInputElement;
