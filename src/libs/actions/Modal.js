"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCloseModal = setCloseModal;
exports.close = close;
exports.onModalDidClose = onModalDidClose;
exports.setModalVisibility = setModalVisibility;
exports.willAlertModalBecomeVisible = willAlertModalBecomeVisible;
exports.setDisableDismissOnEscape = setDisableDismissOnEscape;
exports.closeTop = closeTop;
exports.areAllModalsHidden = areAllModalsHidden;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var closeModals = [];
var onModalClose;
var isNavigate;
var shouldCloseAll;
/**
 * Allows other parts of the app to call modal close function
 */
function setCloseModal(onClose) {
    if (!closeModals.includes(onClose)) {
        closeModals.push(onClose);
    }
    return function () {
        var index = closeModals.indexOf(onClose);
        if (index === -1) {
            return;
        }
        closeModals.splice(index, 1);
    };
}
/**
 * Close topmost modal
 */
function closeTop() {
    if (closeModals.length === 0) {
        return;
    }
    if (onModalClose) {
        closeModals[closeModals.length - 1](isNavigate);
        closeModals.pop();
        return;
    }
    closeModals[closeModals.length - 1]();
    closeModals.pop();
}
/**
 * Close modal in other parts of the app
 */
function close(onModalCloseCallback, isNavigating, shouldCloseAllModals) {
    if (isNavigating === void 0) { isNavigating = true; }
    if (shouldCloseAllModals === void 0) { shouldCloseAllModals = false; }
    if (closeModals.length === 0) {
        onModalCloseCallback();
        return;
    }
    onModalClose = onModalCloseCallback;
    shouldCloseAll = shouldCloseAllModals;
    isNavigate = isNavigating;
    closeTop();
}
function onModalDidClose() {
    if (!onModalClose) {
        return;
    }
    if (closeModals.length && shouldCloseAll) {
        closeTop();
        return;
    }
    onModalClose();
    onModalClose = null;
    isNavigate = undefined;
}
/**
 * Allows other parts of the app to know when a modal has been opened or closed
 */
function setModalVisibility(isVisible, type) {
    if (type === void 0) { type = null; }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.MODAL, { isVisible: isVisible, type: type });
}
/**
 * Allows other parts of the app to set whether modals should be dismissible using the Escape key
 */
function setDisableDismissOnEscape(disableDismissOnEscape) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.MODAL, { disableDismissOnEscape: disableDismissOnEscape });
}
/**
 * Allows other parts of app to know that an alert modal is about to open.
 * This will trigger as soon as a modal is opened but not yet visible while animation is running.
 * isPopover indicates that the next open modal is popover or bottom docked
 */
function willAlertModalBecomeVisible(isVisible, isPopover) {
    if (isPopover === void 0) { isPopover = false; }
    // We cancel the pending and active tooltips here instead of in setModalVisibility because
    // we want to do it when a modal is going to show. If we do it when the modal is fully shown,
    // the tooltip in that modal won't show.
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.MODAL, { willAlertModalBecomeVisible: isVisible, isPopover: isPopover });
}
function areAllModalsHidden() {
    return closeModals.length === 0;
}
