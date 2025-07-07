"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getComponentDisplayName;
/** Returns the display name of a component */
function getComponentDisplayName(component) {
    var _a, _b;
    return (_b = (_a = component.displayName) !== null && _a !== void 0 ? _a : component.name) !== null && _b !== void 0 ? _b : 'Component';
}
