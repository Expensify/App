import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import * as KeyCommand from 'react-native-key-command';
import bindHandlerToKeydownEvent from './bindHandlerToKeydownEvent';
import getOperatingSystem from '../getOperatingSystem';
import CONST from '../../CONST';

const operatingSystem = getOperatingSystem();

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
    let displayName = (() => {
        // Type of key is string and the type of KeyCommand.constants.* is number | string. Use _.isEqual to match different types.
        if (_.isEqual(key, KeyCommand.constants.keyInputEnter.toString())) {
            return ['ENTER'];
        }
        if (_.isEqual(key, KeyCommand.constants.keyInputEscape.toString())) {
            return ['ESCAPE'];
        }
        if (_.isEqual(key, KeyCommand.constants.keyInputUpArrow.toString())) {
            return ['ARROWUP'];
        }
        if (_.isEqual(key, KeyCommand.constants.keyInputDownArrow.toString())) {
            return ['ARROWDOWN'];
        }
        return [key.toUpperCase()];
    })();

    if (_.isString(modifiers)) {
        displayName.unshift(modifiers);
    } else if (_.isArray(modifiers)) {
        displayName = [..._.sortBy(modifiers), ...displayName];
    }

    displayName = _.map(displayName, modifier => lodashGet(CONST.KEYBOARD_SHORTCUT_KEY_DISPLAY_NAME, modifier.toUpperCase(), modifier));

    return displayName.join(' + ');
}

_.each(CONST.KEYBOARD_SHORTCUTS, (shortcut) => {
    KeyCommand.addListener(
        shortcut.trigger[operatingSystem] || shortcut.trigger.DEFAULT,
        (keycommandEvent, event) => bindHandlerToKeydownEvent(getDisplayName, eventHandlers, keycommandEvent, event),
    );
});

/**
 * Unsubscribes a keyboard event handler.
 *
 * @param {String} displayName The display name for the key combo to stop watching
 * @param {String} callbackID The specific ID given to the callback at the time it was added
 * @private
 */
function unsubscribe(displayName, callbackID) {
    eventHandlers[displayName] = _.reject(eventHandlers[displayName], callback => callback.id === callbackID);
}

/**
 * Return platform specific modifiers for keys like Control (CMD on macOS)
 *
 * @param {Array<String>} keys
 * @returns {Array}
 */
function getPlatformEquivalentForKeys(keys) {
    return _.map(keys, (key) => {
        if (!_.has(CONST.PLATFORM_SPECIFIC_KEYS, key)) {
            return key;
        }

        const platformModifiers = CONST.PLATFORM_SPECIFIC_KEYS[key];
        return lodashGet(platformModifiers, operatingSystem, platformModifiers.DEFAULT || key);
    });
}

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
    const displayName = getDisplayName(key, platformAdjustedModifiers);
    if (!_.has(eventHandlers, displayName)) {
        eventHandlers[displayName] = [];
    }

    const callbackID = Str.guid();
    eventHandlers[displayName].splice(priority, 0, {
        id: callbackID,
        callback,
        captureOnInputs,
        shouldPreventDefault,
        shouldBubble,
    });

    if (descriptionKey) {
        documentedShortcuts[displayName] = {
            shortcutKey: key,
            descriptionKey,
            displayName,
            modifiers,
        };
    }

    return () => unsubscribe(displayName, callbackID);
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
