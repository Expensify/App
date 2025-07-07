"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var KeyCommand = require("react-native-key-command");
var getOperatingSystem_1 = require("@libs/getOperatingSystem");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var CONST_1 = require("@src/CONST");
var bindHandlerToKeydownEvent_1 = require("./bindHandlerToKeydownEvent");
var operatingSystem = (0, getOperatingSystem_1.default)();
// Handlers for the various keyboard listeners we set up
var eventHandlers = {};
// Documentation information for keyboard shortcuts that are displayed in the keyboard shortcuts informational modal
var documentedShortcuts = {};
function getDocumentedShortcuts() {
    return Object.values(documentedShortcuts).sort(function (a, b) { return (0, LocaleCompare_1.default)(a.displayName, b.displayName); });
}
var keyInputEnter = (_c = (_b = (_a = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants) === null || _a === void 0 ? void 0 : _a.keyInputEnter) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : 'keyInputEnter';
var keyInputEscape = (_f = (_e = (_d = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants) === null || _d === void 0 ? void 0 : _d.keyInputEscape) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : 'keyInputEscape';
var keyInputUpArrow = (_j = (_h = (_g = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants) === null || _g === void 0 ? void 0 : _g.keyInputUpArrow) === null || _h === void 0 ? void 0 : _h.toString()) !== null && _j !== void 0 ? _j : 'keyInputUpArrow';
var keyInputDownArrow = (_m = (_l = (_k = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants) === null || _k === void 0 ? void 0 : _k.keyInputDownArrow) === null || _l === void 0 ? void 0 : _l.toString()) !== null && _m !== void 0 ? _m : 'keyInputDownArrow';
var keyInputLeftArrow = (_q = (_p = (_o = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants) === null || _o === void 0 ? void 0 : _o.keyInputLeftArrow) === null || _p === void 0 ? void 0 : _p.toString()) !== null && _q !== void 0 ? _q : 'keyInputLeftArrow';
var keyInputRightArrow = (_t = (_s = (_r = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants) === null || _r === void 0 ? void 0 : _r.keyInputRightArrow) === null || _s === void 0 ? void 0 : _s.toString()) !== null && _t !== void 0 ? _t : 'keyInputRightArrow';
var keyInputSpace = ' ';
/**
 * Generates the normalized display name for keyboard shortcuts.
 */
function getDisplayName(key, modifiers) {
    var displayName = (function () {
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
    }
    else if (Array.isArray(modifiers)) {
        displayName = __spreadArray(__spreadArray([], modifiers.sort(), true), displayName, true);
    }
    displayName = displayName.map(function (modifier) { var _a; return (_a = CONST_1.default.KEYBOARD_SHORTCUT_KEY_DISPLAY_NAME[modifier.toUpperCase()]) !== null && _a !== void 0 ? _a : modifier; });
    return displayName.join(' + ');
}
Object.values(CONST_1.default.KEYBOARD_SHORTCUTS).forEach(function (shortcut) {
    var _a;
    // If there is no trigger for the current OS nor a default trigger, then we don't need to do anything
    if (!('trigger' in shortcut)) {
        return;
    }
    var shortcutTrigger = (_a = (operatingSystem && shortcut.trigger[operatingSystem])) !== null && _a !== void 0 ? _a : shortcut.trigger.DEFAULT;
    KeyCommand.addListener(shortcutTrigger, function (keyCommandEvent, event) { return (0, bindHandlerToKeydownEvent_1.default)(getDisplayName, eventHandlers, keyCommandEvent, event); });
});
/**
 * Unsubscribes a keyboard event handler.
 */
function unsubscribe(displayName, callbackID) {
    var _a;
    eventHandlers[displayName] = eventHandlers[displayName].filter(function (callback) { return callback.id !== callbackID; });
    if (((_a = eventHandlers[displayName]) === null || _a === void 0 ? void 0 : _a.length) === 0) {
        delete documentedShortcuts[displayName];
    }
}
/**
 * Return platform specific modifiers for keys like Control (CMD on macOS)
 */
function getPlatformEquivalentForKeys(keys) {
    return keys.map(function (key) {
        var _a, _b;
        if (!(key in CONST_1.default.PLATFORM_SPECIFIC_KEYS)) {
            return key;
        }
        var platformModifiers = CONST_1.default.PLATFORM_SPECIFIC_KEYS[key];
        return (_b = (_a = platformModifiers === null || platformModifiers === void 0 ? void 0 : platformModifiers[operatingSystem]) !== null && _a !== void 0 ? _a : platformModifiers.DEFAULT) !== null && _b !== void 0 ? _b : key;
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
function subscribe(key, callback, descriptionKey, modifiers, captureOnInputs, shouldBubble, priority, shouldPreventDefault, excludedNodes, shouldStopPropagation) {
    if (modifiers === void 0) { modifiers = ['CTRL']; }
    if (captureOnInputs === void 0) { captureOnInputs = false; }
    if (shouldBubble === void 0) { shouldBubble = false; }
    if (priority === void 0) { priority = 0; }
    if (shouldPreventDefault === void 0) { shouldPreventDefault = true; }
    if (excludedNodes === void 0) { excludedNodes = []; }
    if (shouldStopPropagation === void 0) { shouldStopPropagation = false; }
    var platformAdjustedModifiers = getPlatformEquivalentForKeys(modifiers);
    var displayName = getDisplayName(key, platformAdjustedModifiers);
    if (!eventHandlers[displayName]) {
        eventHandlers[displayName] = [];
    }
    var callbackID = expensify_common_1.Str.guid();
    eventHandlers[displayName].splice(priority, 0, {
        id: callbackID,
        callback: callback,
        captureOnInputs: captureOnInputs,
        shouldPreventDefault: shouldPreventDefault,
        shouldBubble: shouldBubble,
        excludedNodes: excludedNodes,
        shouldStopPropagation: shouldStopPropagation,
    });
    if (descriptionKey) {
        documentedShortcuts[displayName] = {
            shortcutKey: key,
            descriptionKey: descriptionKey,
            displayName: displayName,
            modifiers: modifiers,
        };
    }
    return function () { return unsubscribe(displayName, callbackID); };
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
var KeyboardShortcut = {
    subscribe: subscribe,
    getDisplayName: getDisplayName,
    getDocumentedShortcuts: getDocumentedShortcuts,
    getPlatformEquivalentForKeys: getPlatformEquivalentForKeys,
};
exports.default = KeyboardShortcut;
