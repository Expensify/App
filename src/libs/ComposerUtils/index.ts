import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getNumberOfLines from './getNumberOfLines';
import updateNumberOfLines from './updateNumberOfLines';

type Selection = {
    start: number;
    end: number;
};

/**
 * Replace substring between selection with a text.
 */
function insertText(text: string, selection: Selection, textToInsert: string): string {
    return text.slice(0, selection.start) + textToInsert + text.slice(selection.end, text.length);
}

/**
 * Check whether we can skip trigger hotkeys on some specific devices.
 */
function canSkipTriggerHotkeys(isSmallScreenWidth: boolean, isKeyboardShown: boolean): boolean {
    // Do not trigger actions for mobileWeb or native clients that have the keyboard open
    // because for those devices, we want the return key to insert newlines rather than submit the form
    return (isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen()) || isKeyboardShown;
}

/**
 * Returns the length of the common suffix between two input strings.
 * The common suffix is the number of characters shared by both strings
 * at the end (suffix) until a mismatch is encountered.
 *
 * @returns The length of the common suffix between the strings.
 */
function getCommonSuffixLength(str1: string, str2: string): number {
    let i = 0;
    while (str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
        i++;
    }
    return i;
}

export {getNumberOfLines, updateNumberOfLines, insertText, canSkipTriggerHotkeys, getCommonSuffixLength};
