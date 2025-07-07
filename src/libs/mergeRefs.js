"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mergeRefs;
/**
 * Assigns element reference to multiple refs.
 * @param refs The ref object or function arguments.
 */
function mergeRefs() {
    var refs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        refs[_i] = arguments[_i];
    }
    return function (value) {
        refs.forEach(function (ref) {
            if (typeof ref === 'function') {
                ref(value);
            }
            else if (ref != null) {
                // eslint-disable-next-line no-param-reassign
                ref.current = value;
            }
        });
    };
}
