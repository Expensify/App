import type {View} from 'react-native';
import {TextInput} from 'react-native';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import isWindowReadyToFocus from './isWindowReadyToFocus';

type ModalId = number | undefined;

type InputElement = (TextInput & HTMLElement) | null;

type BusinessType = ValueOf<typeof CONST.MODAL.BUSINESS_TYPE> | undefined;

type RestoreFocusType = ValueOf<typeof CONST.MODAL.RESTORE_FOCUS_TYPE> | undefined;

type ModalContainer = View | HTMLElement | undefined | null;

type FocusMapValue = {
    input: InputElement;
    businessType?: BusinessType;
};

type PromiseMapValue = {
    ready: Promise<void>;
    resolve: () => void;
};

let focusedInput: InputElement = null;
let uniqueModalId = 1;
const focusMap = new Map<ModalId, FocusMapValue>();
const activeModals: ModalId[] = [];
const promiseMap = new Map<ModalId, PromiseMapValue>();

/**
 * react-native-web doesn't support `currentlyFocusedInput`, so we need to make it compatible.
 */
function getActiveInput() {
    return (TextInput.State.currentlyFocusedInput ? TextInput.State.currentlyFocusedInput() : TextInput.State.currentlyFocusedField()) as InputElement;
}

/**
 * On web platform, if the modal is displayed by a click, the blur event is fired before the modal appears,
 * so we need to cache the focused input in the pointerdown handler, which is fired before the blur event.
 */
function saveFocusedInput() {
    focusedInput = getActiveInput();
}

/**
 * If a click does not display the modal, we also should clear the cached value to avoid potential issues.
 */
function clearFocusedInput() {
    if (!focusedInput) {
        return;
    }

    // we have to use timeout because of measureLayout
    setTimeout(() => (focusedInput = null), CONST.ANIMATION_IN_TIMING);
}

/**
 * When a TextInput is unmounted, we also should release the reference here to avoid potential issues.
 *
 */
function releaseInput(input: InputElement) {
    if (!input) {
        return;
    }
    if (input === focusedInput) {
        focusedInput = null;
    }
    [...focusMap].forEach(([key, value]) => {
        if (value.input !== input) {
            return;
        }
        focusMap.delete(key);
    });
}

function getId() {
    return uniqueModalId++;
}

/**
 * Save the focus state when opening the modal.
 */
function saveFocusState(id: ModalId, businessType: BusinessType = CONST.MODAL.BUSINESS_TYPE.DEFAULT, shouldClearFocusWithType = false, container: ModalContainer = undefined) {
    const activeInput = getActiveInput();

    // For popoverWithoutOverlay, react calls autofocus before useEffect.
    const input = focusedInput ?? activeInput;
    focusedInput = null;
    if (activeModals.indexOf(id) < 0) {
        activeModals.push(id);
    }

    if (shouldClearFocusWithType) {
        [...focusMap].forEach(([key, value]) => {
            if (value.businessType !== businessType) {
                return;
            }
            focusMap.delete(key);
        });
    }

    if (container && 'contains' in container && container.contains(input)) {
        return;
    }
    focusMap.set(id, {input, businessType});
    if (!input) {
        return;
    }
    input.blur();
}

/**
 * On web platform, if we intentionally click on another input box, there is no need to restore focus.
 * Additionally, if we are closing the RHP, we can ignore the focused input.
 */
function focus(input: InputElement, shouldIgnoreFocused = false) {
    if (!input) {
        return;
    }
    if (shouldIgnoreFocused) {
        isWindowReadyToFocus().then(() => input.focus());
        return;
    }
    const activeInput = getActiveInput();
    if (activeInput) {
        return;
    }
    isWindowReadyToFocus().then(() => input.focus());
}

/**
 * Restore the focus state after the modal is dismissed.
 */
function restoreFocusState(
    id: ModalId,
    shouldIgnoreFocused = false,
    businessType: BusinessType = CONST.MODAL.BUSINESS_TYPE.DEFAULT,
    restoreFocusType: RestoreFocusType = CONST.MODAL.RESTORE_FOCUS_TYPE.DEFAULT,
) {
    if (!id) {
        return;
    }

    // The stack is empty
    if (activeModals.length < 1) {
        return;
    }
    const index = activeModals.indexOf(id);

    // This id has been removed from the stack.
    if (index < 0) {
        return;
    }
    activeModals.splice(index, 1);
    if (restoreFocusType === CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE) {
        return;
    }

    const {input} = focusMap.get(id) ?? {};
    focusMap.delete(id);
    if (restoreFocusType === CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE) {
        return;
    }

    // This modal is not the topmost one, do not restore it.
    if (activeModals.length > index) {
        if (input) {
            const lastId = activeModals.slice(-1)[0];
            focusMap.set(lastId, {...focusMap.get(lastId), input});
        }
        return;
    }
    if (input) {
        focus(input, shouldIgnoreFocused);
        return;
    }

    // Try to find the topmost one and restore it
    const stack = [...focusMap].filter(([, v]) => v.input && v.businessType === businessType);
    if (stack.length < 1) {
        return;
    }
    const [lastId, {input: lastInput}] = stack.slice(-1)[0];

    // The previous modal is still active
    if (activeModals.indexOf(lastId) >= 0) {
        return;
    }
    focus(lastInput, shouldIgnoreFocused);
    focusMap.delete(lastId);
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

function getKey(id: ModalId) {
    if (id) {
        return id;
    }
    if (promiseMap.size < 1) {
        return 0;
    }
    return [...promiseMap.keys()].slice(-1)[0];
}

function setReadyToFocus(id: ModalId) {
    const key = getKey(id);
    const promise = promiseMap.get(key);
    if (!promise) {
        return;
    }
    promise.resolve?.();
    promiseMap.delete(key);
}

function isReadyToFocus(id: ModalId = undefined) {
    const key = getKey(id);
    const promise = promiseMap.get(key);
    if (!promise) {
        return Promise.resolve();
    }
    return promise.ready;
}

function tryRestoreFocusAfterClosedCompletely(id: ModalId, businessType: BusinessType, restoreType: RestoreFocusType) {
    isReadyToFocus(id)?.then(() => restoreFocusState(id, false, businessType, restoreType));
}

/**
 * So far, this will only be called in file canceled event handler.
 */
function tryRestoreFocusByExternal(businessType: BusinessType) {
    const stack = [...focusMap].filter(([, value]) => value.businessType === businessType && value.input);
    if (stack.length < 1) {
        return;
    }
    const [key, {input}] = stack.slice(-1)[0];
    focusMap.delete(key);
    if (!input) {
        return;
    }
    focus(input);
}

export type {InputElement};

export default {
    getId,
    saveFocusedInput,
    clearFocusedInput,
    releaseInput,
    saveFocusState,
    restoreFocusState,
    resetReadyToFocus,
    setReadyToFocus,
    isReadyToFocus,
    tryRestoreFocusAfterClosedCompletely,
    tryRestoreFocusByExternal,
};
