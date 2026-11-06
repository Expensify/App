import variables from '@styles/variables';

const COLLAPSE_DURATION = 100;
const RESTORE_DURATION = 300;
// Assumed vertical space for the focused input field that is used to reserve space above the keyboard.
const VERTICAL_SPACE_FOR_FOCUSED_INPUT = variables.inputHeight + variables.inputPaddingBottom + variables.inputPaddingTop;
const KEYBOARD_OPENING_PROGRESS_THRESHOLDS = [0.5, 0.7, 0.8, 0.85, 0.9, 0.95, 0.99];
const MIN_HEADER_HEIGHT_ON_COLLAPSE = 8;

function isKeyboardOpeningAtGivenProgress(keyboardProgress: number, prevKeyboardProgress: number, requiredProgress: number[]): boolean {
    'worklet';

    return requiredProgress.some((progress) => keyboardProgress > progress && prevKeyboardProgress <= progress);
}

/**
 * Tells a keyboard frame apart from the ones worth acting on, so that `CollapsibleHeaderOnKeyboard` and
 * `CollapsibleHeaderOnKeyboardGroup` cannot drift apart on when they collapse.
 */
function getKeyboardCollapseState(keyboardProgress: number, prevKeyboardProgress: number, keyboardHeight: number): {isKeyboardClosed: boolean; shouldReact: boolean} {
    'worklet';

    if (keyboardProgress === 0 && keyboardHeight === 0) {
        return {isKeyboardClosed: true, shouldReact: false};
    }

    // The keyboard is closing
    if (prevKeyboardProgress > keyboardProgress) {
        return {isKeyboardClosed: false, shouldReact: false};
    }

    const isKeyboardStartingOpening = prevKeyboardProgress === 0 && keyboardProgress > 0;
    const isKeyboardOpeningAndReachingThreshold = isKeyboardOpeningAtGivenProgress(keyboardProgress, prevKeyboardProgress, KEYBOARD_OPENING_PROGRESS_THRESHOLDS);
    const isKeyboardFullyOpen = keyboardProgress === 1;

    return {isKeyboardClosed: false, shouldReact: isKeyboardStartingOpening || isKeyboardOpeningAndReachingThreshold || isKeyboardFullyOpen};
}

/**
 * Vertical space the collapsing content can take once the keyboard, the focused input and everything accounted for by
 * `collapsibleHeaderOffset` have taken theirs. Shared so the single-header and the group maths cannot diverge.
 */
function getAvailableHeightForCollapsibleContent(availableWindowHeight: number, keyboardHeight: number, collapsibleHeaderOffset: number): number {
    'worklet';

    // keyboardHeight is negative when open (e.g. -291), so keyboardTop = availableWindowHeight + keyboardHeight.
    const keyboardTop = availableWindowHeight + keyboardHeight;
    return keyboardTop - VERTICAL_SPACE_FOR_FOCUSED_INPUT - collapsibleHeaderOffset;
}

export {COLLAPSE_DURATION, RESTORE_DURATION, MIN_HEADER_HEIGHT_ON_COLLAPSE, getKeyboardCollapseState, getAvailableHeightForCollapsibleContent};
