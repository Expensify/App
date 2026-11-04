import getPromptMaxHeightOnKeyboardOpenLandscapeMode from './getPromptMaxHeightOnKeyboardOpenLandscapeMode';
import PROMPT_MAX_AUTO_GROW_HEIGHT from './promptMaxAutoGrowHeight';

// The iOS keyboard is smaller than the Android keyboard, so we want to show one more line compared to the Android version.
const MAX_PROMPT_LINES_WITH_KEYBOARD = 3;
const PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE = getPromptMaxHeightOnKeyboardOpenLandscapeMode(MAX_PROMPT_LINES_WITH_KEYBOARD);

export {PROMPT_MAX_AUTO_GROW_HEIGHT, PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE};
