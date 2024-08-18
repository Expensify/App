import React from 'react';
import type {MutableRefObject} from 'react';
import type {TextInput} from 'react-native';
import SCREENS from '@src/SCREENS';
import getTopmostRouteName from './Navigation/getTopmostRouteName';
import isReportOpenInRHP from './Navigation/isReportOpenInRHP';
import navigationRef from './Navigation/navigationRef';

type FocusCallback = (shouldFocusForNonBlurInputOnTapOutside?: boolean) => void;

const composerRef: MutableRefObject<TextInput | null> = React.createRef<TextInput>();
const editComposerRef = React.createRef<TextInput>();
// There are two types of composer: general composer (edit composer) and main composer.
// The general composer callback will take priority if it exists.
let focusCallback: FocusCallback | null = null;
let mainComposerFocusCallback: FocusCallback | null = null;

/**
 * Register a callback to be called when focus is requested.
 * Typical uses of this would be call the focus on the ReportActionComposer.
 *
 * @param callback callback to register
 */
function onComposerFocus(callback: FocusCallback | null, isMainComposer = false) {
    if (isMainComposer) {
        mainComposerFocusCallback = callback;
    } else {
        focusCallback = callback;
    }
}

/**
 * Request focus on the ReportActionComposer
 */
function focus(shouldFocusForNonBlurInputOnTapOutside?: boolean) {
    /** Do not trigger the refocusing when the active route is not the report screen */
    const navigationState = navigationRef.getState();
    if (!navigationState || (!isReportOpenInRHP(navigationState) && getTopmostRouteName(navigationState) !== SCREENS.REPORT)) {
        return;
    }

    if (typeof focusCallback !== 'function') {
        if (typeof mainComposerFocusCallback !== 'function') {
            return;
        }

        mainComposerFocusCallback(shouldFocusForNonBlurInputOnTapOutside);
        return;
    }

    focusCallback();
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

export default {
    composerRef,
    onComposerFocus,
    focus,
    clear,
    isFocused,
    editComposerRef,
    isEditFocused,
};
