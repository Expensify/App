import {Keyboard} from 'react-native';
import CONST from '@src/CONST';

type InputType = (typeof CONST.INPUT_TYPES_WITH_KEYBOARD)[number];
type TCallbackFn = () => void;

const isInputKeyboardType = (element: Element | null): boolean => {
    if (element && ((element.tagName === 'INPUT' && CONST.INPUT_TYPES_WITH_KEYBOARD.includes((element as HTMLInputElement).type as InputType)) || element.tagName === 'TEXTAREA')) {
        return true;
    }
    return false;
};

const isVisible = (): boolean => {
    const focused = document.activeElement;
    return isInputKeyboardType(focused);
};

const nullFn: () => null = () => null;

let isKeyboardListenerRunning = false;
let currentVisibleElement: Element | null = null;
const showListeners: TCallbackFn[] = [];
const hideListeners: TCallbackFn[] = [];
const visualViewport = window.visualViewport ?? {
    height: window.innerHeight,
    width: window.innerWidth,
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window),
};
let previousVPHeight = visualViewport.height;

const handleViewportResize = (): void => {
    if (visualViewport.height < previousVPHeight) {
        if (isInputKeyboardType(document.activeElement) && document.activeElement !== currentVisibleElement) {
            showListeners.forEach((fn) => fn());
        }
    }

    if (visualViewport.height > previousVPHeight) {
        if (!isVisible()) {
            hideListeners.forEach((fn) => fn());
        }
    }

    previousVPHeight = visualViewport.height;
    currentVisibleElement = document.activeElement;
};

const startKeboardListeningService = (): void => {
    isKeyboardListenerRunning = true;
    visualViewport.addEventListener('resize', handleViewportResize);
};

const addListener = (eventName: 'keyboardDidShow' | 'keyboardDidHide', callbackFn: TCallbackFn): (() => void) => {
    if ((eventName !== 'keyboardDidShow' && eventName !== 'keyboardDidHide') || !callbackFn) {
        throw new Error('Invalid eventName passed to addListener()');
    }

    if (eventName === 'keyboardDidShow') {
        showListeners.push(callbackFn);
    }

    if (eventName === 'keyboardDidHide') {
        hideListeners.push(callbackFn);
    }

    if (!isKeyboardListenerRunning) {
        startKeboardListeningService();
    }

    return () => {
        if (eventName === 'keyboardDidShow') {
            showListeners.filter((fn) => fn !== callbackFn);
        }

        if (eventName === 'keyboardDidHide') {
            hideListeners.filter((fn) => fn !== callbackFn);
        }

        if (isKeyboardListenerRunning && !showListeners.length && !hideListeners.length) {
            visualViewport.removeEventListener('resize', handleViewportResize);
            isKeyboardListenerRunning = false;
        }
    };
};

export default {
    /**
     * Whether the keyboard is last known to be visible.
     */
    isVisible,
    /**
     * Dismisses the active keyboard and removes focus.
     */
    dismiss: Keyboard.dismiss,
    /**
     * The `addListener` function connects a JavaScript function to an identified native
     * keyboard notification event.
     *
     * This function then returns the reference to the listener.
     *
     * {string} eventName The `nativeEvent` is the string that identifies the event you're listening for.  This
     * can be any of the following:
     *
     * - `keyboardWillShow`
     * - `keyboardDidShow`
     * - `keyboardWillHide`
     * - `keyboardDidHide`
     * - `keyboardWillChangeFrame`
     * - `keyboardDidChangeFrame`
     *
     * Note that if you set `android:windowSoftInputMode` to `adjustResize`  or `adjustNothing`,
     * only `keyboardDidShow` and `keyboardDidHide` events will be available on Android.
     * `keyboardWillShow` as well as `keyboardWillHide` are generally not available on Android
     * since there is no native corresponding event.
     *
     * On Web only two events are available:
     *
     * - `keyboardDidShow`
     * - `keyboardDidHide`
     *
     * {function} callback function to be called when the event fires.
     */
    addListener,
    /**
     * Useful for syncing TextInput (or other keyboard accessory view) size of
     * position changes with keyboard movements.
     * Not working on web.
     */
    scheduleLayoutAnimation: nullFn,
    /**
     * Return the metrics of the soft-keyboard if visible. Currently not working on web.
     */
    metrics: nullFn,
};
