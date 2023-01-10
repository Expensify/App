import _ from 'underscore';

/**
 * Checks if an event for that key is configured and if so, runs it.
 * @param {Event} event
 * @param {Function} callback The callback to call
 * @private
 */
function bindHandlerToKeydownEvent(event, callback) {
    if (!_.isFunction(callback.callback)) {
        return;
    }

    callback.callback(event);
}

export default {
    bindHandlerToKeydownEvent,
};
