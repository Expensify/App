"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hideKeyboardOnSwipe = {
    // temporary solution - better to hide a keyboard than see keyboard flickering
    // see https://github.com/software-mansion/react-native-screens/issues/2021 for more details
    keyboardHandlingEnabled: true,
};
exports.default = hideKeyboardOnSwipe;
