import _ from 'underscore';

/**
 * Gets modifiers from a keyboard event.
 *
 * @param {Event} event
 * @returns {Array<String>}
 */
function getKeyEventModifiers(event) {
    const modifiers = [];

    if ((event instanceof KeyboardEvent)) {
        if (event.shiftKey) {
            modifiers.push('SHIFT');
        }
        if (event.ctrlKey) {
            modifiers.push('CONTROL');
        }
        if (event.metaKey) {
            modifiers.push('META');
        }

        return modifiers;
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
    if (!(event instanceof KeyboardEvent)) {
        return;
    }

    const eventModifiers = getKeyEventModifiers(event);
    const displayName = getDisplayName(event.key, eventModifiers);

    // Loop over all the callbacks
    _.every(eventHandlers[displayName], (callback) => {
        // If configured to do so, prevent input text control to trigger this event
        if (!callback.captureOnInputs && (
            event.target.nodeName === 'INPUT'
            || event.target.nodeName === 'TEXTAREA'
            || event.target.contentEditable === 'true'
        )) {
            return true;
        }

        // Determine if the event should bubble before executing the callback (which may have side-effects)
        let shouldBubble = callback.shouldBubble || false;
        if (_.isFunction(callback.shouldBubble)) {
            shouldBubble = callback.shouldBubble();
        }

        if (_.isFunction(callback.callback)) {
            callback.callback(event);
        }
        if (callback.shouldPreventDefault) {
            event.preventDefault();
        }

        // If the event should not bubble, short-circuit the loop
        return shouldBubble;
    });
}

export {
    getKeyEventModifiers,
    bindHandlerToKeydownEvent,
};
