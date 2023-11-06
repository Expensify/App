import {Keyboard} from 'react-native';
import _ from 'underscore';

// <input /> types that will show a virtual keyboard in a mobile browser
const INPUT_TYPES_WITH_KEYBOARD = ['text', 'search', 'tel', 'url', 'email', 'password'];

const isInputKeyboardType = (element) => {
    if (!!element && ((element.tagName === 'INPUT' && INPUT_TYPES_WITH_KEYBOARD.includes(element.type)) || element.tagName === 'TEXTAREA')) {
        return true;
    }
    return false;
};

const isVisible = () => {
    const focused = document.activeElement;
    return isInputKeyboardType(focused);
};

const nullFn = () => null;

let isKeyboardListenerRunning = false;
let currentVisibleElement = null;
const showListeners = [];
const hideListeners = [];
const SHOW_EVENT_NAME = 'keyboardDidShow';
const HIDE_EVENT_NAME = 'keyboardDidHide';
let previousVPHeight = window.visualViewport.height;

const handleVPResize = () => {
    if (window.visualViewport.height < previousVPHeight) {
        // this might mean virtual keyboard showed up
        // checking if any input element is in focus
        if (isInputKeyboardType(document.activeElement) && document.activeElement !== currentVisibleElement) {
            // input el is focused - v keyboard is up
            showListeners.forEach((fn) => fn());
        }
    }

    if (window.visualViewport.height > previousVPHeight) {
        if (!isVisible()) {
            hideListeners.forEach((fn) => fn());
        }
    }

    previousVPHeight = window.visualViewport.height;
    currentVisibleElement = document.activeElement;
};

const startKeboardListeningService = () => {
    isKeyboardListenerRunning = true;
    window.visualViewport.addEventListener('resize', handleVPResize);
};

const addListener = (eventName, callbackFn) => {
    if ((eventName !== SHOW_EVENT_NAME && eventName !== HIDE_EVENT_NAME) || !callbackFn) {
        return;
    }

    if (eventName === SHOW_EVENT_NAME) {
        showListeners.push(callbackFn);
    }

    if (eventName === HIDE_EVENT_NAME) {
        hideListeners.push(callbackFn);
    }

    if (!isKeyboardListenerRunning) {
        startKeboardListeningService();
    }

    return () => {
        if (eventName === SHOW_EVENT_NAME) {
            _.filter(showListeners, (fn) => fn !== callbackFn);
        }

        if (eventName === HIDE_EVENT_NAME) {
            _.filter(hideListeners, (fn) => fn !== callbackFn);
        }

        if (isKeyboardListenerRunning && !showListeners.length && !hideListeners.length) {
            window.visualViewport.removeEventListener('resize', handleVPResize);
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
     * Return the metrics of the soft-keyboard if visible. Currently now working on web.
     */
    metrics: nullFn,
};
