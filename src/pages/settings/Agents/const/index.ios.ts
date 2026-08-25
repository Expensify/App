import getPromptMaxHeightOnKeyboardOpenLandscapeMode from './getPromptMaxHeightOnKeyboardOpenLandscapeMode';

// The iOS keyboard is smaller than the Android keyboard, so we want to show one more line compared to the Android version.
const MAX_PROMPT_LINES_WITH_KEYBOARD = 3;
const PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE = getPromptMaxHeightOnKeyboardOpenLandscapeMode(MAX_PROMPT_LINES_WITH_KEYBOARD);

// eslint-disable-next-line import/prefer-default-export
export {PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE};
