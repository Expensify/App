import variables from '@styles/variables';

const COLLAPSE_DURATION = 100;
const RESTORE_DURATION = 300;
// Assumed vertical space for the focused input field — used to reserve space above the keyboard.
const VERTICAL_SPACE_FOR_FOCUSED_INPUT = variables.inputHeight + variables.inputPaddingBottom + variables.inputPaddingTop;
const KEYBOARD_OPENING_PROGRESS_THRESHOLDS = [0.5, 0.7, 0.8, 0.85, 0.9, 0.95, 0.99];
const MIN_HEADER_HEIGHT_ON_COLLAPSE = 8;

function isKeyboardOpeningAtGivenProgress(keyboardProgress: number, prevKeyboardProgress: number, requiredProgress: number[]): boolean {
    'worklet';

    return requiredProgress.some((progress) => keyboardProgress > progress && prevKeyboardProgress <= progress);
}

export {COLLAPSE_DURATION, RESTORE_DURATION, VERTICAL_SPACE_FOR_FOCUSED_INPUT, KEYBOARD_OPENING_PROGRESS_THRESHOLDS, MIN_HEADER_HEIGHT_ON_COLLAPSE, isKeyboardOpeningAtGivenProgress};
