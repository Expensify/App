import {TextInput} from 'react-native';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import isWindowReadyToFocus from './isWindowReadyToFocus';

type ModalId = number | undefined;

type InputElement = (TextInput & HTMLElement) | null;

type RestoreFocusType = ValueOf<typeof CONST.MODAL.RESTORE_FOCUS_TYPE> | undefined;

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

    // For the PopoverWithMeasuredContent component, Modal is only mounted after onLayout event is triggered,
    // this event is placed within a setTimeout in react-native-web,
    // so we can safely clear the cached value only after this event.
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
    for (const [key, value] of focusMap.entries()) {
        if (value.input !== input) {
            continue;
        }
        focusMap.delete(key);
    }
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
function focus(input: InputElement, shouldIgnoreFocused = false) {
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
    focus(input, shouldIgnoreFocused);
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
        focus(input, shouldIgnoreFocused);
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
    refocusAfterModalFullyClosed,
    tryRestoreTopmostFocus,
};
