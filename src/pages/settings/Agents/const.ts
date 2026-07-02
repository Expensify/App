import variables from '@styles/variables';

const MAX_PROMPT_LINES_WITH_KEYBOARD = 2;
const PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE = variables.componentSizeLarge + variables.lineHeightXLarge * (MAX_PROMPT_LINES_WITH_KEYBOARD - 1);

export {PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE};
