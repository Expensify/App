import getNumberOfLines from './getNumberOfLines';
import updateNumberOfLines from './updateNumberOfLines';
import * as DeviceCapabilities from '../DeviceCapabilities';

/**
 * Replace substring between selection with a text.
 * @param {String} text
 * @param {Object} selection
 * @param {String} textToInsert
 * @returns {String}
 */
function insertText(text, selection, textToInsert) {
    return text.slice(0, selection.start) + textToInsert + text.slice(selection.end, text.length);
}

/**
 * Check whether we can skip trigger hotkeys on some specific devices.
 * @param {Boolean} isSmallScreenWidth
 * @param {Boolean} isKeyboardShown
 * @returns {Boolean}
 */
function canSkipTriggerHotkeys(isSmallScreenWidth, isKeyboardShown) {
    // Do not trigger actions for mobileWeb or native clients that have the keyboard open
    // because for those devices, we want the return key to insert newlines rather than submit the form
    return (isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen()) || isKeyboardShown;
}

/**
 * Find length of common ending of two strings
 * @param {String} str1
 * @param {String} str2
 * @returns {Number}
 */
function getCommonEndingLength(str1, str2) {
    let i = 0;
    while (str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
        i++;
    }
    return i;
}

export {getNumberOfLines, updateNumberOfLines, insertText, canSkipTriggerHotkeys, getCommonEndingLength};
