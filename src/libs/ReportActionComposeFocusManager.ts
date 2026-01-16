import {findFocusedRoute} from '@react-navigation/native';
import type {RefObject} from 'react';
import React from 'react';
import type {TextInput} from 'react-native';
import SCREENS from '@src/SCREENS';
import isReportOpenInRHP from './Navigation/helpers/isReportOpenInRHP';
import navigationRef from './Navigation/navigationRef';
import preventTextInputFocusOnFirstResponderOnce from './preventTextInputFocusOnFirstResponderOnce';

type ComposerType = 'main' | 'edit';

type FocusContext = 'main' | 'sidePanel';

type FocusCallback = (shouldFocusForNonBlurInputOnTapOutside?: boolean) => void;

// Default refs for backward compatibility (main context)
const defaultComposerRef: RefObject<TextInput | null> = React.createRef<TextInput>();
const defaultEditComposerRef: RefObject<TextInput | null> = React.createRef<TextInput>();

// Context-aware refs and callbacks - each context (main screen vs side panel) has its own set
const composerRefs = new Map<FocusContext, RefObject<TextInput | null>>([
    ['main', defaultComposerRef],
    ['sidePanel', React.createRef<TextInput>()],
]);

const editComposerRefs = new Map<FocusContext, RefObject<TextInput | null>>([
    ['main', defaultEditComposerRef],
    ['sidePanel', React.createRef<TextInput>()],
]);

const focusCallbacks = new Map<FocusContext, FocusCallback | null>([
    ['main', null],
    ['sidePanel', null],
]);

const priorityFocusCallbacks = new Map<FocusContext, FocusCallback | null>([
    ['main', null],
    ['sidePanel', null],
]);

// Backward compatibility - expose the main context refs directly
const composerRef = defaultComposerRef;
const editComposerRef = defaultEditComposerRef;

/**
 * Get the composer ref for a specific context
 */
function getComposerRef(context: FocusContext): RefObject<TextInput | null> {
    return composerRefs.get(context) ?? defaultComposerRef;
}

/**
 * Get the edit composer ref for a specific context
 */
function getEditComposerRef(context: FocusContext): RefObject<TextInput | null> {
    return editComposerRefs.get(context) ?? defaultEditComposerRef;
}

/**
 * Register a callback to be called when focus is requested.
 * Typical uses of this would be call the focus on the ReportActionComposer.
 *
 * @param callback callback to register
 * @param isPriorityCallback whether this is a priority callback (edit composer)
 * @param context the focus context ('main' or 'sidePanel')
 */
function onComposerFocus(callback: FocusCallback | null, isPriorityCallback = false, context: FocusContext = 'main') {
    if (isPriorityCallback) {
        priorityFocusCallbacks.set(context, callback);
    } else {
        focusCallbacks.set(context, callback);
    }
}

/**
 * Request focus on the ReportActionComposer
 * @param shouldFocusForNonBlurInputOnTapOutside whether to focus for non-blur input on tap outside
 * @param context the focus context ('main' or 'sidePanel')
 */
function focus(shouldFocusForNonBlurInputOnTapOutside?: boolean, context: FocusContext = 'main') {
    /** Do not trigger the refocusing when the active route is not the report screen */
    const navigationState = navigationRef.getState();
    const focusedRoute = findFocusedRoute(navigationState);
    if (!navigationState || (!isReportOpenInRHP(navigationState) && focusedRoute?.name !== SCREENS.REPORT && focusedRoute?.name !== SCREENS.SEARCH.MONEY_REQUEST_REPORT)) {
        return;
    }

    const priorityCallback = priorityFocusCallbacks.get(context);
    const regularCallback = focusCallbacks.get(context);

    if (typeof priorityCallback !== 'function' && typeof regularCallback !== 'function') {
        return;
    }

    if (typeof priorityCallback === 'function') {
        priorityCallback(shouldFocusForNonBlurInputOnTapOutside);
        return;
    }

    if (typeof regularCallback === 'function') {
        regularCallback();
    }
}

/**
 * Clear the registered focus callback
 * @param isPriorityCallback whether to clear the priority callback
 * @param context the focus context ('main' or 'sidePanel')
 */
function clear(isPriorityCallback = false, context: FocusContext = 'main') {
    if (isPriorityCallback) {
        const editRef = editComposerRefs.get(context);
        if (editRef) {
            editRef.current = null;
        }
        priorityFocusCallbacks.set(context, null);
    } else {
        focusCallbacks.set(context, null);
    }
}

/**
 * Exposes the current focus state of the report action composer.
 * @param context the focus context ('main' or 'sidePanel'). If undefined, checks if ANY composer is focused.
 */
function isFocused(context?: FocusContext): boolean {
    if (context === undefined) {
        // Check if any composer in any context is focused
        for (const ref of composerRefs.values()) {
            if (ref?.current?.isFocused()) {
                return true;
            }
        }
        return false;
    }
    const ref = composerRefs.get(context);
    return !!ref?.current?.isFocused();
}

/**
 * Exposes the current focus state of the edit message composer.
 * @param context the focus context ('main' or 'sidePanel'). If undefined, checks if ANY edit composer is focused.
 */
function isEditFocused(context?: FocusContext): boolean {
    if (context === undefined) {
        // Check if any edit composer in any context is focused
        for (const ref of editComposerRefs.values()) {
            if (ref?.current?.isFocused()) {
                return true;
            }
        }
        return false;
    }
    const ref = editComposerRefs.get(context);
    return !!ref?.current?.isFocused();
}

/**
 * Check if any composer (main or edit) in the side panel context is focused
 */
function isSidePanelFocused(): boolean {
    const sidePanelComposerRef = composerRefs.get('sidePanel');
    const sidePanelEditRef = editComposerRefs.get('sidePanel');
    return !!sidePanelComposerRef?.current?.isFocused() || !!sidePanelEditRef?.current?.isFocused();
}

/**
 * This will prevent the composer's text input from focusing the next time it becomes the
 * first responder in the UIResponder chain. (iOS only, no-op on Android)
 * @param context the focus context ('main' or 'sidePanel')
 */
function preventComposerFocusOnFirstResponderOnce(context: FocusContext = 'main') {
    const ref = composerRefs.get(context);
    if (ref) {
        preventTextInputFocusOnFirstResponderOnce(ref);
    }
}

/**
 * This will prevent the edit composer's text input from focusing the next time it becomes the
 * first responder in the UIResponder chain. (iOS only, no-op on Android)
 * @param context the focus context ('main' or 'sidePanel')
 */
function preventEditComposerFocusOnFirstResponderOnce(context: FocusContext = 'main') {
    const ref = editComposerRefs.get(context);
    if (ref) {
        preventTextInputFocusOnFirstResponderOnce(ref);
    }
}

export default {
    composerRef,
    editComposerRef,
    getComposerRef,
    getEditComposerRef,
    onComposerFocus,
    focus,
    clear,
    isFocused,
    isEditFocused,
    isSidePanelFocused,
    preventComposerFocusOnFirstResponderOnce,
    preventEditComposerFocusOnFirstResponderOnce,
};

export type {ComposerType, FocusContext};
