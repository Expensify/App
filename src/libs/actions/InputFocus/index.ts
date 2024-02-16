import type {Modal} from '@src/types/onyx';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function inputFocusChange(focus: boolean) {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function composerFocusKeepFocusOn(ref: HTMLElement, isFocused: boolean, modal: Modal, onyxFocused: boolean) {}
const callback = (method: () => void) => method();

export {composerFocusKeepFocusOn, inputFocusChange, callback};
