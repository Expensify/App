"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var attachmentModalHandler = {
    handleModalClose: function (onCloseCallback) {
        // Ensure `AttachmentCarousel` is unmounted before `AttachmentModal` is closed to prevent any delay in the attachment preview when closing the modal.
        // This delay causes the attachment preview to slide to the right on iOS, especially when there is an animation involved.
        // The issue is tracked in https://github.com/Expensify/App/issues/52937.
        // `InteractionManager.runAfterInteractions` ensures that `onCloseCallback` is executed only after all interactions and animations have completed,
        // preventing any unintended visual delay or jarring transition when the modal is closed.
        react_native_1.InteractionManager.runAfterInteractions(function () {
            onCloseCallback === null || onCloseCallback === void 0 ? void 0 : onCloseCallback();
        });
    },
};
exports.default = attachmentModalHandler;
