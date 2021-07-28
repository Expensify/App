import _ from 'underscore';

const events = {};

/**
 * Checks if an event for that key is configured and if so, runs it.
 * @param {Event} event
 * @private
 */
function bindHandlerToKeyupEvent(event) {
    if (events[event.keyCode] === undefined) {
        return;
    }

    const eventCallbacks = events[event.keyCode];
    const reversedEventCallbacks = [...eventCallbacks].reverse();

    // Loop over all the callbacks
    _.every(reversedEventCallbacks, (callback) => {
        const pressedModifiers = _.all(callback.modifiers, (modifier) => {
            if (modifier === 'shift' && !event.shiftKey) {
                return false;
            }
            if (modifier === 'control' && !event.ctrlKey) {
                return false;
            }
            if (modifier === 'alt' && !event.altKey) {
                return false;
            }
            if (modifier === 'meta' && !event.metaKey) {
                return false;
            }
            return true;
        });

        const extraModifiers = _.difference(['shift', 'control', 'alt', 'meta'], callback.modifiers);

        // returns true if extra modifiers are pressed
        const pressedExtraModifiers = _.some(extraModifiers, (extraModifier) => {
            if (extraModifier === 'shift' && event.shiftKey) {
                return true;
            }
            if (extraModifier === 'control' && event.ctrlKey) {
                return true;
            }
            if (extraModifier === 'alt' && event.altKey) {
                return true;
            }
            if (extraModifier === 'meta' && event.metaKey) {
                return true;
            }
            return false;
        });
        if (!pressedModifiers || pressedExtraModifiers) {
            return true;
        }

        // If configured to do so, prevent input text control to trigger this event
        if (!callback.captureOnInputs && (
            event.target.nodeName === 'INPUT'
            || event.target.nodeName === 'TEXTAREA'
            || event.target.contentEditable === 'true'
        )) {
            return true;
        }

        if (_.isFunction(callback.callback)) {
            callback.callback(event);
        }
        event.preventDefault();

        // Short circuit the loop because the event is triggered
        return false;
    });
}

// Make sure we don't add multiple listeners
document.removeEventListener('keydown', bindHandlerToKeyupEvent, {capture: true});
document.addEventListener('keydown', bindHandlerToKeyupEvent, {capture: true});

/**
 * Returns keyCode for a given key
 * @param {String} key The key to watch, i.e. 'K' or 'Escape'
 * @returns {Number} The key's keyCode, i.e. 75 or 27
 * @private
 */
function getKeyCode(key) {
    // For keys that have longer names we must catch and return the correct key key.charCodeAt(0) would return the
    // key code for 'E' (the letter at index 0 in the string) not 'Escape'
    switch (key) {
        case 'Enter':
            return 13;
        case 'Escape':
            return 27;
        default:
            return key.charCodeAt(0);
    }
}

/**
 * Unsubscribes to a keyboard event.
 * @param {Number} key The key to stop watching
 * @private
 */
function unsubscribe(key) {
    const keyCode = getKeyCode(key);
    events[keyCode].pop();
}

/**
 * Subscribes to a keyboard event.
 * @param {String} key The key to watch, i.e. 'K' or 'Escape'
 * @param {Function} callback The callback to call
 * @param {String|Array} modifiers Can either be shift or control
 * @param {Boolean} captureOnInputs Should we capture the event on inputs too?
 * @returns {Function} clean up method
 */
function subscribe(key, callback, modifiers = 'shift', captureOnInputs = false) {
    const keyCode = getKeyCode(key);
    if (events[keyCode] === undefined) {
        events[keyCode] = [];
    }
    events[keyCode].push({callback, modifiers: _.isArray(modifiers) ? modifiers : [modifiers], captureOnInputs});
    return () => unsubscribe(key);
}

/**
 * Module storing the different keyboard shortcut
 *
 * We are using a push/pop model where new event are pushed at the end of an
 * array of events. When the event occur, we trigger the callback of the last
 * element. This allow us to replace shortcut from a page to a dialog without
 * having the page having to handle that logic.
 *
 * This is also following the convention of the PubSub module.
 * The "subClass" is used by pages to bind /unbind with no worries
 */
const KeyboardShortcut = {
    subscribe,
};

export default KeyboardShortcut;
