"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Navigation_1 = require("@libs/Navigation/Navigation");
/**
 * On iOS, the navigation transition can sometimes break other animations, such as the closing modal.
 * In this case we need to wait for the animation to be complete before executing the navigation
 */
function navigateAfterInteraction(callback) {
    react_native_1.InteractionManager.runAfterInteractions(function () {
        Navigation_1.default.setNavigationActionToMicrotaskQueue(callback);
    });
}
exports.default = navigateAfterInteraction;
