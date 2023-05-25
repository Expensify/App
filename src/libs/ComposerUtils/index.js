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

export {getNumberOfLines, updateNumberOfLines, insertText, canSkipTriggerHotkeys};
