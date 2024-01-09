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

export {getNumberOfLines, updateNumberOfLines, insertText, canSkipTriggerHotkeys};
