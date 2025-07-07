"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESSIBILITY_ROLE_FORM = void 0;
exports.forceClearInput = forceClearInput;
/**
 * Web password field needs `current-password` as autocomplete type which is not supported on native
 */
var ACCESSIBILITY_ROLE_FORM = 'form';
exports.ACCESSIBILITY_ROLE_FORM = ACCESSIBILITY_ROLE_FORM;
function forceClearInput(animatedInputRef) {
    'worklet';
    var input = animatedInputRef.current;
    if (input && 'clear' in input && typeof input.clear === 'function') {
        input.clear();
    }
}
