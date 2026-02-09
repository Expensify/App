import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import CONST from '@src/CONST';

function blurActiveInputElement(): void {
    const activeElement = document.activeElement;

    if (!(activeElement instanceof HTMLElement)) {
        return;
    }

    if (activeElement.tagName !== CONST.ELEMENT_NAME.INPUT && activeElement.tagName !== CONST.ELEMENT_NAME.TEXTAREA) {
        return;
    }

    blurActiveElement();
}

export default blurActiveInputElement;
