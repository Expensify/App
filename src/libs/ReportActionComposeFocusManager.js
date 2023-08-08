import _ from 'underscore';
import React from 'react';

const composerRef = React.createRef();
let focusCallback = null;
let mainComposerFocusCallback = null;

/**
 * Register a callback to be called when focus is requested.
 * Typical uses of this would be call the focus on the ReportActionComposer.
 *
 * @param {Function} callback callback to register
 */
function onComposerFocus(callback, isMainComposer = false) {
    if (isMainComposer) {
        console.log('registering mainComposerFocusCallback')
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
    console.log('calling focussss')
    if (!_.isFunction(focusCallback)) {
        if (!_.isFunction(mainComposerFocusCallback)) {
            console.log('mainComposerFocusCallbackkkk', mainComposerFocusCallback)
            return;
        }

        console.log('mainComposerFocusCallback');
        mainComposerFocusCallback();
        return;
    }

    console.log('calling focusCallback')

    focusCallback();
}

/**
 * Clear the registered focus callback
 *
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
