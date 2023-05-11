import * as Browser from '../Browser';
import CONST from '../../CONST';

/**
 * Check if the Enter key was pressed during IME confirmation (i.e. while the text is being composed).
 * See {@link https://en.wikipedia.org/wiki/Input_method}
 * @param {Event} event
 * @returns {boolean}
 */
const isEnterWhileComposition = (event) => {
    // if on mobile chrome, the enter key event is never fired when the enter key is pressed while composition.
    if (Browser.isMobileChrome()) {
        return false;
    }

    // On Safari, isComposing returns false on Enter keypress event even for IME confirmation. Although keyCode is deprecated,
    // reading keyCode is the only way available to distinguish Enter keypress event for IME confirmation.
    if (CONST.BROWSER.SAFARI === Browser.getBrowser()) {
        return event.keyCode === 229;
    }
    return event.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && event.nativeEvent && event.nativeEvent.isComposing;
};

export default isEnterWhileComposition;
