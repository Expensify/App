import variables from '@styles/variables';

function getPromptMaxHeightOnKeyboardOpenLandscapeMode(maxPromptLinesWithKeyboard: number) {
    return variables.componentSizeLarge + variables.lineHeightXLarge * (maxPromptLinesWithKeyboard - 1);
}

export default getPromptMaxHeightOnKeyboardOpenLandscapeMode;
