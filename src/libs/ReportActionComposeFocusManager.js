import _ from 'underscore';

let focusCallback = null;

/**
 * Register a callback to be called when focus is requested.
 * Typical uses of this would be call the focus on the ReportActionComposer.
 *
 * @param {Function} callback callback to register
 */
function onComposerFocus(callback) {
    focusCallback = callback;
}

/**
 * Request focus on the ReportActionComposer
 *
 */
function focus() {
    if (_.isFunction(focusCallback)) {
        focusCallback();
    }
}

/**
 * Clear the registered focus callback
 *
 */
function clear() {
    focusCallback = null;
}

export default {
    onComposerFocus,
    focus,
    clear,
};
