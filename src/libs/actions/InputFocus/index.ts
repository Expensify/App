import type { Modal } from "@src/types/onyx";

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
function inputFocusChange(_focus: boolean) {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
function composerFocusKeepFocusOn(_ref: HTMLElement, _isFocused: boolean, _modal: Modal, _onyxFocused: boolean) {}
const callback = (method: () => void) => method();

export {composerFocusKeepFocusOn, inputFocusChange, callback};
