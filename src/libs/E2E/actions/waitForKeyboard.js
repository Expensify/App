"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = waitForKeyboard;
var react_native_1 = require("react-native");
function waitForKeyboard() {
    return new Promise(function (resolve) {
        function checkKeyboard() {
            if (react_native_1.Keyboard.isVisible()) {
                resolve();
            }
            else {
                console.debug("[E2E] Waiting for keyboard to appear\u2026");
                setTimeout(checkKeyboard, 1000);
            }
        }
        checkKeyboard();
    });
}
