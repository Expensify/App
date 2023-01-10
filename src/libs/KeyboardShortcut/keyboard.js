import _ from 'underscore';

/**
 * Checks if an event for that key is configured and if so, runs it.
 * @param {Event} event
 * @param {Function} callback The callback to call
 * @private
 */
function bindHandlerToKeydownEvent(event, callback) {
    if (!(event instanceof KeyboardEvent)) {
        return;
    }

    // If configured to do so, prevent input text control to trigger this event
    if (!callback.captureOnInputs && (
        event.target.nodeName === 'INPUT'
        || event.target.nodeName === 'TEXTAREA'
        || event.target.contentEditable === 'true'
    )) {
        return;
    }

    // Determine if the event should bubble before executing the callback (which may have side-effects)
    if (_.isFunction(callback.shouldBubble)) {
        callback.shouldBubble();
    }
    if (_.isFunction(callback.callback)) {
        callback.callback(event);
    }
    if (callback.shouldPreventDefault) {
        event.preventDefault();
    }
}

export default {
    bindHandlerToKeydownEvent,
};
