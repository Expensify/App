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
 * Insert a white space at given index of text
 * @param text - text that needs whitespace to be appended to
 * @param index  - index at which whitespace should be inserted
 * @returns
 */

function insertWhiteSpaceAtIndex(text: string, index: number) {
    return `${text.slice(0, index)} ${text.slice(index)}`;
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
 * Finds the length of common suffix between two texts
 * @param str1 - first string to compare
 * @param str2 - next string to compare
 * @returns number - Length of the common suffix
 */
function findCommonSuffixLength(str1: string, str2: string) {
    let commonSuffixLength = 0;
    const minLength = Math.min(str1.length, str2.length);
    for (let i = 1; i <= minLength; i++) {
        if (str1.charAt(str1.length - i) === str2.charAt(str2.length - i)) {
            commonSuffixLength++;
        } else {
            break;
        }
    }

    return commonSuffixLength;
}

export {getNumberOfLines, updateNumberOfLines, insertText, canSkipTriggerHotkeys, insertWhiteSpaceAtIndex, findCommonSuffixLength};
