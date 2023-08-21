import _ from 'underscore';
import React from 'react';

const composerRef = React.createRef();
// There are two types of composer: general composer (edit composer) and main composer.
// The general composer callback will take priority if it exists.
let focusCallback = null;
let mainComposerFocusCallback = null;

/**
 * Register a callback to be called when focus is requested.
 * Typical uses of this would be call the focus on the ReportActionComposer.
 *
 * @param {Function} callback callback to register
 * @param {Boolean} isMainComposer
 */
function onComposerFocus(callback, isMainComposer = false) {
    if (isMainComposer) {
        mainComposerFocusCallback = callback;
    } else {
        focusCallback = callback;
    }
}

/**
 * Request focus on the ReportActionComposer
 *
 */
function focus() {
    if (!_.isFunction(focusCallback)) {
        if (!_.isFunction(mainComposerFocusCallback)) {
            return;
        }

        mainComposerFocusCallback();
        return;
    }

    focusCallback();
}

/**
 * Clear the registered focus callback
 *
 * @param {Boolean} isMainComposer
 */
function clear(isMainComposer = false) {
    if (isMainComposer) {
        mainComposerFocusCallback = null;
    } else {
        focusCallback = null;
    }
}

/**
 * Exposes the current focus state of the report action composer.
 * @return {Boolean} isFocused
 */
function isFocused() {
    return composerRef.current && composerRef.current.isFocused();
}

export default {
    composerRef,
    onComposerFocus,
    focus,
    clear,
    isFocused,
};
