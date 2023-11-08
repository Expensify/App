import React from 'react';
import {TextInput} from 'react-native';
import ROUTES from '@src/ROUTES';
import Navigation from './Navigation/Navigation';
import willBlurTextInputOnTapOutsideFunc from './willBlurTextInputOnTapOutside';

type FocusCallback = (shouldFocus?: boolean) => void;

const composerRef = React.createRef<TextInput>();
const editComposerRef = React.createRef<TextInput>();
// There are two types of composer: general composer (edit composer) and main composer.
// The general composer callback will take priority if it exists.
let focusCallback: FocusCallback | null = null;
let mainComposerFocusCallback: FocusCallback | null = null;

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();
let isKeyboardVisibleWhenShowingModal = false;

/**
 * Register a callback to be called when focus is requested.
 * Typical uses of this would be call the focus on the ReportActionComposer.
 *
 * @param callback callback to register
 */
function onComposerFocus(callback: FocusCallback, isMainComposer = false) {
    if (isMainComposer) {
        mainComposerFocusCallback = callback;
    } else {
        focusCallback = callback;
    }
}

/**
 * Request focus on the ReportActionComposer
 */
function focus(shouldFocus?: boolean) {
    /** Do not trigger the refocusing when the active route is not the report route, */
    if (!Navigation.isActiveRoute(ROUTES.REPORT_WITH_ID.getRoute(Navigation.getTopmostReportId() ?? ''))) {
        return;
    }

    if (typeof focusCallback !== 'function') {
        if (typeof mainComposerFocusCallback !== 'function') {
            return;
        }
        mainComposerFocusCallback(shouldFocus);
        return;
    }

    focusCallback(shouldFocus);
}

/**
 * Clear the registered focus callback
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

function setIsKeyboardVisibleWhenShowingModal(value: boolean) {
    isKeyboardVisibleWhenShowingModal = value;
}

/**
 * Restore focus state of ReportActionCompose
 */
function restoreFocusState() {
    if (!isKeyboardVisibleWhenShowingModal) {
        return;
    }
    focus(true);
    isKeyboardVisibleWhenShowingModal = false;
}

/**
 * Blur ReportActionCompose
 */
function blur() {
    let focusedInstance = null;
    if (isFocused()) {
        focusedInstance = composerRef.current;
    } else if (isEditFocused()) {
        focusedInstance = editComposerRef.current;
    }

    if (!willBlurTextInputOnTapOutside) {
        isKeyboardVisibleWhenShowingModal = !!focusedInstance;
    }

    if (!focusedInstance) {
        return;
    }
    focusedInstance.blur();
}

export default {
    composerRef,
    editComposerRef,
    onComposerFocus,
    focus,
    clear,
    isFocused,
    isEditFocused,
    setIsKeyboardVisibleWhenShowingModal,
    restoreFocusState,
    blur,
};
