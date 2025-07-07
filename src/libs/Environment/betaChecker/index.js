"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * There's no beta build in non native
 */
function isBetaBuild() {
    return Promise.resolve(false);
}
exports.default = {
    isBetaBuild: isBetaBuild,
};
