import _ from 'underscore';
import React from 'react';

const composerRef = React.createRef();
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

/**
 * Tells about the current focus state of the report action composer.
 *
 */
function isFocused() {
    if (composerRef.current) {
        composerRef.current.isFocused();
    }
}

export default {
    composerRef,
    onComposerFocus,
    focus,
    clear,
    isFocused,
};
