import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as KeyCommand from 'react-native-key-command';
import getOperatingSystem from '../getOperatingSystem';
import CONST from '../../CONST';
import keyboard from './keyboard';

// Handlers for the various keyboard listeners we set up
const eventHandlers = {};

// Documentation information for keyboard shortcuts that are displayed in the keyboard shortcuts informational modal
const documentedShortcuts = {};

/**
 * @returns {Array}
 */
function getDocumentedShortcuts() {
    return _.values(documentedShortcuts);
}

/**
 * Generates the normalized display name for keyboard shortcuts.
 *
 * @param {String} key
 * @param {String|Array<String>} modifiers
 * @returns {String}
 */
function getDisplayName(key, modifiers) {
    let displayName = [key.toUpperCase()];
    if (_.isString(modifiers)) {
        displayName.unshift(modifiers);
    } else if (_.isArray(modifiers)) {
        displayName = [..._.sortBy(modifiers), ...displayName];
    }

    displayName = _.map(displayName, modifier => lodashGet(CONST.KEYBOARD_SHORTCUT_KEY_DISPLAY_NAME, modifier.toUpperCase(), modifier));

    return displayName.join(' + ');
}

/**
 * Return platform specific modifiers for keys like Control (CMD on macOS)
 *
 * @param {Array<String>} keys
 * @returns {Array}
 */
function getPlatformEquivalentForKeys(keys) {
    const operatingSystem = getOperatingSystem();
    return _.map(keys, (key) => {
        if (!_.has(CONST.PLATFORM_SPECIFIC_KEYS, key)) {
            return key;
        }

        const platformModifiers = CONST.PLATFORM_SPECIFIC_KEYS[key];
        return lodashGet(platformModifiers, operatingSystem, platformModifiers.DEFAULT || key);
    });
}

const getLibraryAdjustedModifiers = (modifiers) => {
    const operatingSystem = getOperatingSystem();

    const libraryAdjustedModifier = _.find(CONST.KEYCOMMAND_LIBRARY_SPECIFIC_KEYS, key => _.isEqual(modifiers, key[0]));
    return _.get(libraryAdjustedModifier, [1, operatingSystem]);
};

const getLibraryAdjustedInput = (input) => {
    const key = input.toLowerCase();

    if (key === 'escape') {
        return KeyCommand.constants.keyInputEscape;
    }

    if (key === 'enter') {
        return KeyCommand.constants.keyInputEnter;
    }

    if (key === 'arrowup') {
        return KeyCommand.constants.keyInputUpArrow;
    }

    if (key === 'arrowdown') {
        return KeyCommand.constants.keyInputDownArrow;
    }

    return key;
};

/**
 * Subscribes to a keyboard event.
 * @param {String} key The key to watch, i.e. 'K' or 'Escape'
 * @param {Function} callback The callback to call
 * @param {String} descriptionKey Translation key for shortcut description
 * @param {Array<String>} [modifiers] Can either be shift or control
 * @param {Boolean} [captureOnInputs] Should we capture the event on inputs too?
 * @param {Boolean|Function} [shouldBubble] Should the event bubble?
 * @param {Number} [priority] The position the callback should take in the stack. 0 means top priority, and 1 means less priority than the most recently added.
 * @param {Boolean} [shouldPreventDefault] Should call event.preventDefault after callback?
 * @returns {Function} clean up method
 */
function subscribe(key, callback, descriptionKey, modifiers = 'shift', captureOnInputs = false, shouldBubble = false, priority = 0, shouldPreventDefault = true) {
    const platformAdjustedModifiers = getPlatformEquivalentForKeys(modifiers);
    const libraryAdjustedModifiers = getLibraryAdjustedModifiers(modifiers);

    const libraryAdjustedInput = getLibraryAdjustedInput(key);
    const displayName = getDisplayName(key, platformAdjustedModifiers);

    if (!_.has(eventHandlers, displayName)) {
        eventHandlers[displayName] = [];
    }

    KeyCommand.addListener({input: libraryAdjustedInput, modifierFlags: libraryAdjustedModifiers}, (payload, event) => {
        keyboard.bindHandlerToKeydownEvent(event, {
            captureOnInputs,
            shouldBubble,
            callback,
            shouldPreventDefault,
        });
    });

    if (descriptionKey) {
        documentedShortcuts[displayName] = {
            shortcutKey: key,
            descriptionKey,
            displayName,
            modifiers,
        };
    }

    return () => {};
}

/**
 * This module configures a global keyboard event handler.
 *
 * It uses a stack to store event handlers for each key combination. Some additional details:
 *
 *   - By default, new handlers are pushed to the top of the stack. If you pass a >0 priority when subscribing to the key event,
 *     then the handler will get pushed further down the stack. This means that priority of 0 is higher than priority 1.
 *
 *   - When a key event occurs, we trigger callbacks for that key starting from the top of the stack.
 *     By default, events do not bubble, and only the handler at the top of the stack will be executed.
 *     Individual callbacks can be configured with the shouldBubble parameter, to allow the next event handler on the stack execute.
 *
 *   - Each handler has a unique callbackID, so calling the `unsubscribe` function (returned from `subscribe`) will unsubscribe the expected handler,
 *     regardless of its position in the stack.
 */
const KeyboardShortcut = {
    subscribe,
    getDocumentedShortcuts,
};

export default KeyboardShortcut;
