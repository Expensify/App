import {Str} from 'expensify-common';
import * as KeyCommand from 'react-native-key-command';
import getOperatingSystem from '@libs/getOperatingSystem';
import CONST from '@src/CONST';
import bindHandlerToKeydownEvent from './bindHandlerToKeydownEvent';

const operatingSystem = getOperatingSystem();

type EventHandler = {
    id: string;
    callback: (event?: KeyboardEvent) => void;
    captureOnInputs: boolean;
    shouldPreventDefault: boolean;
    shouldBubble: boolean | (() => void);
    excludedNodes: string[];
    shouldStopPropagation: boolean;
};

// Handlers for the various keyboard listeners we set up
const eventHandlers: Record<string, EventHandler[]> = {};

type ShortcutModifiers = readonly ['CTRL'] | readonly ['SHIFT'] | readonly ['CTRL', 'SHIFT'] | readonly [];

type Shortcut = {
    displayName: string;
    shortcutKey: string;
    descriptionKey: string;
    modifiers: ShortcutModifiers;
};

// Documentation information for keyboard shortcuts that are displayed in the keyboard shortcuts informational modal
const documentedShortcuts: Record<string, Shortcut> = {};

const keyInputEnter = KeyCommand?.constants?.keyInputEnter?.toString() ?? 'keyInputEnter';
const keyInputEscape = KeyCommand?.constants?.keyInputEscape?.toString() ?? 'keyInputEscape';
const keyInputUpArrow = KeyCommand?.constants?.keyInputUpArrow?.toString() ?? 'keyInputUpArrow';
const keyInputDownArrow = KeyCommand?.constants?.keyInputDownArrow?.toString() ?? 'keyInputDownArrow';
const keyInputLeftArrow = KeyCommand?.constants?.keyInputLeftArrow?.toString() ?? 'keyInputLeftArrow';
const keyInputRightArrow = KeyCommand?.constants?.keyInputRightArrow?.toString() ?? 'keyInputRightArrow';
const keyInputSpace = ' ';

/**
 * Generates the normalized display name for keyboard shortcuts.
 */
function getDisplayName(key: string, modifiers: string | string[]): string {
    let displayName = (() => {
        // Type of key is string and the type of KeyCommand.constants.* is number | string.
        if (key.toLowerCase() === keyInputEnter.toLowerCase()) {
            return ['ENTER'];
        }
        if (key.toLowerCase() === keyInputEscape.toLowerCase()) {
            return ['ESCAPE'];
        }
        if (key.toLowerCase() === keyInputUpArrow.toLowerCase()) {
            return ['ARROWUP'];
        }
        if (key.toLowerCase() === keyInputDownArrow.toLowerCase()) {
            return ['ARROWDOWN'];
        }
        if (key.toLowerCase() === keyInputLeftArrow.toLowerCase()) {
            return ['ARROWLEFT'];
        }
        if (key.toLowerCase() === keyInputRightArrow.toLowerCase()) {
            return ['ARROWRIGHT'];
        }
        if (key === keyInputSpace) {
            return ['SPACE'];
        }
        return [key.toUpperCase()];
    })();

    if (typeof modifiers === 'string') {
        displayName.unshift(modifiers);
    } else if (Array.isArray(modifiers)) {
        displayName = [...modifiers.sort(), ...displayName];
    }

    displayName = displayName.map((modifier) => CONST.KEYBOARD_SHORTCUT_KEY_DISPLAY_NAME[modifier.toUpperCase() as keyof typeof CONST.KEYBOARD_SHORTCUT_KEY_DISPLAY_NAME] ?? modifier);

    return displayName.join(' + ');
}

for (const shortcut of Object.values(CONST.KEYBOARD_SHORTCUTS)) {
    // If there is no trigger for the current OS nor a default trigger, then we don't need to do anything
    if (!('trigger' in shortcut)) {
        continue;
    }

    const shortcutTrigger = (operatingSystem && shortcut.trigger[operatingSystem as keyof typeof shortcut.trigger]) ?? shortcut.trigger.DEFAULT;

    KeyCommand.addListener(shortcutTrigger, (keyCommandEvent, event) => bindHandlerToKeydownEvent(getDisplayName, eventHandlers, keyCommandEvent, event));
}

/**
 * Unsubscribes a keyboard event handler.
 */
function unsubscribe(displayName: string, callbackID: string) {
    eventHandlers[displayName] = eventHandlers[displayName].filter((callback) => callback.id !== callbackID);
    if (eventHandlers[displayName]?.length === 0) {
        delete documentedShortcuts[displayName];
    }
}

/**
 * Return platform specific modifiers for keys like Control (CMD on macOS)
 */
function getPlatformEquivalentForKeys(keys: ShortcutModifiers): string[] {
    return keys.map((key) => {
        if (!(key in CONST.PLATFORM_SPECIFIC_KEYS)) {
            return key;
        }

        const platformModifiers = CONST.PLATFORM_SPECIFIC_KEYS[key];
        return platformModifiers?.[operatingSystem as keyof typeof platformModifiers] ?? platformModifiers.DEFAULT ?? key;
    });
}

/**
 * Subscribes to a keyboard event.
 * @param key The key to watch, i.e. 'K' or 'Escape'
 * @param callback The callback to call
 * @param descriptionKey Translation key for shortcut description
 * @param [modifiers] Can either be shift or control
 * @param [captureOnInputs] Should we capture the event on inputs too?
 * @param [shouldBubble] Should the event bubble?
 * @param [priority] The position the callback should take in the stack. 0 means top priority, and 1 means less priority than the most recently added.
 * @param [shouldPreventDefault] Should call event.preventDefault after callback?
 * @param [excludedNodes] Do not capture key events targeting excluded nodes (i.e. do not prevent default and let the event bubble)
 * @returns clean up method
 */
function subscribe(
    key: string,
    callback: (event?: KeyboardEvent) => void,
    descriptionKey: string | null,
    modifiers: ShortcutModifiers = ['CTRL'],
    captureOnInputs = false,
    shouldBubble: boolean | (() => boolean) = false,
    priority = 0,
    shouldPreventDefault = true,
    excludedNodes: string[] = [],
    shouldStopPropagation = false,
) {
    const platformAdjustedModifiers = getPlatformEquivalentForKeys(modifiers);
    const displayName = getDisplayName(key, platformAdjustedModifiers);
    if (!eventHandlers[displayName]) {
        eventHandlers[displayName] = [];
    }

    const callbackID = Str.guid();
    eventHandlers[displayName].splice(priority, 0, {
        id: callbackID,
        callback,
        captureOnInputs,
        shouldPreventDefault,
        shouldBubble,
        excludedNodes,
        shouldStopPropagation,
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
    getDisplayName,
    getPlatformEquivalentForKeys,
};

export default KeyboardShortcut;
export type {EventHandler, Shortcut};
