"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * It's impossible to resize on native, so we can always return false.
 */
function useIsResizing() {
    return false;
}
exports.default = useIsResizing;
