"use strict";
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
var KeyCommand = require("react-native-key-command");
var keyModifierControl = (_a = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants.keyModifierControl) !== null && _a !== void 0 ? _a : 'keyModifierControl';
var keyModifierCommand = (_b = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants.keyModifierCommand) !== null && _b !== void 0 ? _b : 'keyModifierCommand';
var keyModifierShift = (_c = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants.keyModifierShift) !== null && _c !== void 0 ? _c : 'keyModifierShift';
var keyModifierShiftControl = (_d = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants.keyModifierShiftControl) !== null && _d !== void 0 ? _d : 'keyModifierShiftControl';
var keyModifierShiftCommand = (_e = KeyCommand === null || KeyCommand === void 0 ? void 0 : KeyCommand.constants.keyModifierShiftCommand) !== null && _e !== void 0 ? _e : 'keyModifierShiftCommand';
/**
 * Gets modifiers from a keyboard event.
 */
function getKeyEventModifiers(event) {
    if (event.modifierFlags === keyModifierControl) {
        return ['CONTROL'];
    }
    if (event.modifierFlags === keyModifierCommand) {
        return ['META'];
    }
    if (event.modifierFlags === keyModifierShiftControl) {
        return ['CONTROL', 'Shift'];
    }
    if (event.modifierFlags === keyModifierShiftCommand) {
        return ['META', 'Shift'];
    }
    if (event.modifierFlags === keyModifierShift) {
        return ['Shift'];
    }
    return [];
}
exports.default = getKeyEventModifiers;
