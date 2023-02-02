import _ from 'underscore';
import * as KeyCommand from 'react-native-key-command';

/**
 * Gets modifiers from a keyboard event.
 *
 * @param {Event} event
 * @returns {Array<String>}
 */
function getKeyEventModifiers(event) {
    if (event.modifierFlags === KeyCommand.constants.keyModifierControl) {
        return ['CONTROL'];
    }
    if (event.modifierFlags === KeyCommand.constants.keyModifierCommand) {
        return ['META'];
    }
    if (event.modifierFlags === KeyCommand.constants.keyModifierShiftControl) {
        return ['SHIFT', 'CONTROL'];
    }
    if (event.modifierFlags === KeyCommand.constants.keyModifierShiftCommand) {
        return ['META', 'CONTROL'];
    }

    return [];
}

/**
 * Checks if an event for that key is configured and if so, runs it.
 * @param {Function} getDisplayName
 * @param {Object} eventHandlers
 * @param {Object} keycommandEvent
 * @param {Event} event
 * @private
 */
function bindHandlerToKeydownEvent(getDisplayName, eventHandlers, keycommandEvent, event) {
    const eventModifiers = getKeyEventModifiers(keycommandEvent);
    const displayName = getDisplayName(keycommandEvent.input, eventModifiers);

    // Loop over all the callbacks
    _.every(eventHandlers[displayName], (callback) => {
        // Determine if the event should bubble before executing the callback (which may have side-effects)
        let shouldBubble = callback.shouldBubble || false;
        if (_.isFunction(callback.shouldBubble)) {
            shouldBubble = callback.shouldBubble();
        }

        if (_.isFunction(callback.callback)) {
            callback.callback(event);
        }

        // If the event should not bubble, short-circuit the loop
        return shouldBubble;
    });
}

export {
    getKeyEventModifiers,
    bindHandlerToKeydownEvent,
};
