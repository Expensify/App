import isHTMLElement from './isHTMLElement';

/** Input types that open no soft keyboard. */
const INPUT_TYPES_WITHOUT_KEYBOARD = new Set(['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit']);

/** Whether focusing the element opens the soft keyboard. `disableKeyboard` renders as `inputMode` 'none' on web. */
function isEditableElement(target: EventTarget | null): target is HTMLElement {
    if (!isHTMLElement(target)) {
        return false;
    }
    if (target.isContentEditable) {
        return true;
    }
    if (target instanceof HTMLInputElement && INPUT_TYPES_WITHOUT_KEYBOARD.has(target.type)) {
        return false;
    }
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        return false;
    }
    return !target.readOnly && !target.disabled && target.inputMode !== 'none';
}

export default isEditableElement;
