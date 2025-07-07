"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is a workaround for a known issue on certain Samsung Android devices
 * So, we use `onPressIn` for Android to ensure the button is pressable.
 * This will be removed once the issue https://github.com/Expensify/App/issues/59953 is resolved.
 */
function createPressHandler(onPress) {
    return {
        onPressIn: onPress,
    };
}
exports.default = createPressHandler;
