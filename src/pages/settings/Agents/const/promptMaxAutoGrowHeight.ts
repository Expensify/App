import getPromptMaxHeightOnKeyboardOpenLandscapeMode from './getPromptMaxHeightOnKeyboardOpenLandscapeMode';

// Tall enough to comfortably read and edit the prompt, while still fitting above the keyboard on smaller phones.
const MAX_PROMPT_LINES_WITH_AUTO_GROW = 10;
const PROMPT_MAX_AUTO_GROW_HEIGHT = getPromptMaxHeightOnKeyboardOpenLandscapeMode(MAX_PROMPT_LINES_WITH_AUTO_GROW);

export default PROMPT_MAX_AUTO_GROW_HEIGHT;
