import variables from '@styles/variables';

const MAX_PROMPT_LINES_WITH_KEYBOARD = 2;
const PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE = variables.componentSizeLarge + variables.lineHeightXLarge * (MAX_PROMPT_LINES_WITH_KEYBOARD - 1);
const SUBMIT_BUTTON_TOP_MARGIN = 20;
// This accounts for submit button (height + top margin) and disclaimer that is displayed below the multiline input
const COLLAPSIBLE_HEADER_OFFSET = variables.componentSizeLarge + variables.lineHeightXLarge + SUBMIT_BUTTON_TOP_MARGIN;

export {PROMPT_MAX_HEIGHT_ON_KEYBOARD_OPEN_LANDSCAPE_MODE, COLLAPSIBLE_HEADER_OFFSET};
