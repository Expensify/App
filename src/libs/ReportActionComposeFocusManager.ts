import React from 'react';
import {TextInput} from 'react-native';
import ROUTES from '@src/ROUTES';
import Navigation from './Navigation/Navigation';

type FocusCallback = () => void;

const composerRef = React.createRef<TextInput>();
const editComposerRef = React.createRef<TextInput>();
// There are two types of focus callbacks: priority and general
// Priority callback would take priority if it existed
let priorityFocusCallback: FocusCallback | null = null;
let focusCallback: FocusCallback | null = null;

/**
 * Register a callback to be called when focus is requested.
 * Typical uses of this would be call the focus on the ReportActionComposer.
 *
 * @param callback callback to register
 */
function onComposerFocus(callback: FocusCallback, isPriorityCallback = false) {
    if (isPriorityCallback) {
        priorityFocusCallback = callback;
    } else {
        focusCallback = callback;
    }
}

/**
 * Request focus on the ReportActionComposer
 */
function focus() {
    /** Do not trigger the refocusing when the active route is not the report route, */
    if (!Navigation.isActiveRoute(ROUTES.REPORT_WITH_ID.getRoute(Navigation.getTopmostReportId() ?? ''))) {
        return;
    }

    if (typeof priorityFocusCallback !== 'function' && typeof focusCallback !== 'function') {
        return;
    }

    if (typeof priorityFocusCallback === 'function') {
        priorityFocusCallback();
        return;
    }

    if (typeof focusCallback === 'function') {
        focusCallback();
    }
}

/**
 * Clear the registered focus callback
 */
function clear(isPriorityCallback = false) {
    if (isPriorityCallback) {
        priorityFocusCallback = null;
    } else {
        focusCallback = null;
    }
}

/**
 * Exposes the current focus state of the report action composer.
 */
function isFocused(): boolean {
    return !!composerRef.current?.isFocused();
}

/**
 * Exposes the current focus state of the edit message composer.
 */
function isEditFocused(): boolean {
    return !!editComposerRef.current?.isFocused();
}

export default {
    composerRef,
    onComposerFocus,
    focus,
    clear,
    isFocused,
    editComposerRef,
    isEditFocused,
};
