import {findFocusedRoute} from '@react-navigation/native';
import type {RefObject} from 'react';
import React from 'react';
import {TextInput} from 'react-native';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import isWindowReadyToFocus from './isWindowReadyToFocus';
import isReportOpenInRHP from './Navigation/helpers/isReportOpenInRHP';
import navigationRef from './Navigation/navigationRef';
import preventTextInputFocusOnFirstResponderOnce from './preventTextInputFocusOnFirstResponderOnce';

// ============================================
// SECTION 1: TYPES
// ============================================

type ModalId = number | undefined;

type InputElement = (TextInput & HTMLElement) | null;

type RestoreFocusType = ValueOf<typeof CONST.MODAL.RESTORE_FOCUS_TYPE> | undefined;

type FocusContext = 'main' | 'sidePanel';

type ComposerType = 'main' | 'edit';

type FocusCallback = (shouldFocusForNonBlurInputOnTapOutside?: boolean) => void;

/**
 * So far, modern browsers only support the file cancel event in some newer versions
 * (i.e., Chrome: 113+ / Firefox: 91+ / Safari 16.4+), and there is no standard feature detection method available.
 * We will introduce the isInUploadingContext field to isolate the impact of the upload modal on the other modals.
 */
type FocusMapValue = {
    input: InputElement;
    isInUploadingContext?: boolean;
};

type PromiseMapValue = {
    ready: Promise<void>;
    resolve: () => void;
};

// ============================================
// SECTION 2: MODAL FOCUS MANAGEMENT
// ============================================

let focusedInput: InputElement = null;
let uniqueModalId = 1;
const focusMap = new Map<ModalId, FocusMapValue>();
const activeModals: ModalId[] = [];
const promiseMap = new Map<ModalId, PromiseMapValue>();

/**
 * Returns the ref of the currently focused text field, if one exists.
 * react-native-web doesn't support `currentlyFocusedInput`, so we need to make it compatible by using `currentlyFocusedField` instead.
 */
function getActiveInput() {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return (TextInput.State.currentlyFocusedInput ? TextInput.State.currentlyFocusedInput() : TextInput.State.currentlyFocusedField()) as InputElement;
}

function getId() {
    return uniqueModalId++;
}

/**
 * Save the focus state when opening the modal.
 */
function saveFocusState(id: ModalId, isInUploadingContext = false, shouldClearFocusWithType = false) {
    const activeInput = getActiveInput();

    // For popoverWithoutOverlay, react calls autofocus before useEffect.
    const input = focusedInput ?? activeInput;
    focusedInput = null;
    if (activeModals.indexOf(id) >= 0) {
        return;
    }
    activeModals.push(id);

    if (shouldClearFocusWithType) {
        for (const [key, value] of focusMap.entries()) {
            if (value.isInUploadingContext !== isInUploadingContext) {
                continue;
            }
            focusMap.delete(key);
        }
    }

    focusMap.set(id, {input, isInUploadingContext});
    input?.blur();
}

/**
 * On web platform, if we intentionally click on another input box, there is no need to restore focus.
 * Additionally, if we are closing the RHP, we can ignore the focused input.
 */
function focusInput(input: InputElement, shouldIgnoreFocused = false) {
    const activeInput = getActiveInput();
    if (!input || (activeInput && !shouldIgnoreFocused)) {
        return;
    }
    isWindowReadyToFocus().then(() => input.focus());
}

function tryRestoreTopmostFocus(shouldIgnoreFocused: boolean, isInUploadingContext = false) {
    const topmost = [...focusMap].findLast(([, v]) => v.input && v.isInUploadingContext === isInUploadingContext);
    if (topmost === undefined) {
        return;
    }
    const [modalId, {input}] = topmost;

    // This modal is still active
    if (activeModals.indexOf(modalId) >= 0) {
        return;
    }
    focusInput(input, shouldIgnoreFocused);
    focusMap.delete(modalId);
}

/**
 * Restore the focus state after the modal is dismissed.
 */
function restoreFocusState(id: ModalId, shouldIgnoreFocused = false, restoreFocusType: RestoreFocusType = CONST.MODAL.RESTORE_FOCUS_TYPE.DEFAULT, isInUploadingContext = false) {
    if (!id || !activeModals.length) {
        return;
    }
    const activeModalIndex = activeModals.indexOf(id);

    // This id has been removed from the stack.
    if (activeModalIndex < 0) {
        return;
    }
    activeModals.splice(activeModalIndex, 1);
    if (restoreFocusType === CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE) {
        return;
    }

    const {input} = focusMap.get(id) ?? {};
    focusMap.delete(id);
    if (restoreFocusType === CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE) {
        return;
    }

    // This modal is not the topmost one, do not restore it.
    if (activeModals.length > activeModalIndex) {
        if (input) {
            const lastId = activeModals.at(-1);
            focusMap.set(lastId, {...focusMap.get(lastId), input});
        }
        return;
    }
    if (input) {
        focusInput(input, shouldIgnoreFocused);
        return;
    }

    // Try to find the topmost one and restore it
    tryRestoreTopmostFocus(shouldIgnoreFocused, isInUploadingContext);
}

function resetReadyToFocus(id: ModalId) {
    const promise: PromiseMapValue = {
        ready: Promise.resolve(),
        resolve: () => {},
    };
    promise.ready = new Promise<void>((resolve) => {
        promise.resolve = resolve;
    });
    promiseMap.set(id, promise);
}

/**
 * Backward compatibility, for cases without an ModalId param, it's fine to just take the topmost one.
 */
function getTopmostModalId() {
    if (promiseMap.size < 1) {
        return 0;
    }
    return [...promiseMap.keys()].at(-1);
}

function setReadyToFocus(id?: ModalId) {
    const key = id ?? getTopmostModalId();
    const promise = promiseMap.get(key);
    if (!promise) {
        return;
    }
    promise.resolve?.();
    promiseMap.delete(key);
}

function isReadyToFocus(id?: ModalId) {
    const key = id ?? getTopmostModalId();
    const promise = promiseMap.get(key);
    if (!promise) {
        return Promise.resolve();
    }
    return promise.ready;
}

function refocusAfterModalFullyClosed(id: ModalId, restoreType: RestoreFocusType, isInUploadingContext?: boolean) {
    isReadyToFocus(id)?.then(() => restoreFocusState(id, false, restoreType, isInUploadingContext));
}

// ============================================
// SECTION 3: REPORT COMPOSER FOCUS
// ============================================

const composerRefs: Record<FocusContext, RefObject<TextInput | null>> = {
    main: React.createRef<TextInput>(),
    sidePanel: React.createRef<TextInput>(),
};

const editComposerRefs: Record<FocusContext, RefObject<TextInput | null>> = {
    main: React.createRef<TextInput>(),
    sidePanel: React.createRef<TextInput>(),
};

const focusCallbacks: Record<FocusContext, FocusCallback | null> = {
    main: null,
    sidePanel: null,
};

const priorityFocusCallbacks: Record<FocusContext, FocusCallback | null> = {
    main: null,
    sidePanel: null,
};

/**
 * Get the composer ref for a specific context
 */
function getComposerRef(context: FocusContext): RefObject<TextInput | null> {
    return composerRefs[context];
}

/**
 * Get the edit composer ref for a specific context
 */
function getEditComposerRef(context: FocusContext): RefObject<TextInput | null> {
    return editComposerRefs[context];
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
        priorityFocusCallbacks[context] = callback;
    } else {
        focusCallbacks[context] = callback;
    }
}

/**
 * Request focus on the ReportActionComposer
 * @param context the focus context ('main' or 'sidePanel')
 */
function focusComposer(context: FocusContext = 'main') {
    /** Do not trigger the refocusing when the active route is not the report screen */
    const navigationState = navigationRef.getState();
    const focusedRoute = findFocusedRoute(navigationState);
    if (!navigationState || (!isReportOpenInRHP(navigationState) && focusedRoute?.name !== SCREENS.REPORT && focusedRoute?.name !== SCREENS.SEARCH.MONEY_REQUEST_REPORT)) {
        return;
    }

    const priorityCallback = priorityFocusCallbacks[context];
    const regularCallback = focusCallbacks[context];

    if (typeof priorityCallback !== 'function' && typeof regularCallback !== 'function') {
        return;
    }

    if (typeof priorityCallback === 'function') {
        priorityCallback();
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
function clearComposerFocus(isPriorityCallback = false, context: FocusContext = 'main') {
    if (isPriorityCallback) {
        const editRef = editComposerRefs[context];
        if (editRef) {
            editRef.current = null;
        }
        priorityFocusCallbacks[context] = null;
    } else {
        focusCallbacks[context] = null;
    }
}

/**
 * Exposes the current focus state of the report action composer.
 */
function isComposerFocused(): boolean {
    // Check if any composer in any context is focused
    for (const ref of Object.values(composerRefs)) {
        if (ref?.current?.isFocused()) {
            return true;
        }
    }

    return false;
}

/**
 * Exposes the current focus state of the edit message composer.
 */
function isEditComposerFocused(): boolean {
    // Check if any edit composer in any context is focused
    for (const ref of Object.values(editComposerRefs)) {
        if (ref?.current?.isFocused()) {
            return true;
        }
    }

    return false;
}

/**
 * This will prevent the composer's text input from focusing the next time it becomes the
 * first responder in the UIResponder chain. (iOS only, no-op on Android)
 */
function preventComposerFocusOnFirstResponderOnce(composerType: ComposerType = 'main') {
    const ref = composerType === 'main' ? composerRefs.main : editComposerRefs.main;

    if (!ref) {
        return;
    }

    preventTextInputFocusOnFirstResponderOnce(ref);
}

/**
 * Refocus the composer after preventing the first responder.
 * @param composerToRefocusOnClose the composer to refocus on close
 * @returns a promise that resolves when the composer is refocused
 */
function refocusComposerAfterPreventFirstResponder(composerToRefocusOnClose?: ComposerType) {
    return isWindowReadyToFocus().then(() => {
        if (composerToRefocusOnClose === 'edit') {
            editComposerRefs.main?.current?.focus();
            return;
        }

        composerRefs.main?.current?.focus();
    });
}

export default {
    // Modal focus management
    getId,
    saveFocusState,
    restoreFocusState,
    resetReadyToFocus,
    setReadyToFocus,
    isReadyToFocus,
    refocusAfterModalFullyClosed,

    // Report composer focus
    getComposerRef,
    getEditComposerRef,
    onComposerFocus,
    focusComposer,
    clearComposerFocus,
    isComposerFocused,
    isEditComposerFocused,
    preventComposerFocusOnFirstResponderOnce,
    refocusComposerAfterPreventFirstResponder,
};

export type {FocusContext, ComposerType};
