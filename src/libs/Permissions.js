"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
// eslint-disable-next-line rulesdir/no-beta-handler
function canUseAllBetas(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1.default.BETAS.ALL));
}
// eslint-disable-next-line rulesdir/no-beta-handler
function isBlockedFromSpotnanaTravel(betas) {
    // Don't check for all betas or nobody can use test travel on dev
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1.default.BETAS.PREVENT_SPOTNANA_TRAVEL));
}
/**
 * Link previews are temporarily disabled.
 */
function canUseLinkPreviews() {
    return false;
}
function isBetaEnabled(beta, betas) {
    // Remove this check once the manual distance tracking feature is fully rolled out
    if (beta === CONST_1.default.BETAS.MANUAL_DISTANCE) {
        return false;
    }
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(beta)) || canUseAllBetas(betas);
}
exports.default = {
    canUseLinkPreviews: canUseLinkPreviews,
    isBlockedFromSpotnanaTravel: isBlockedFromSpotnanaTravel,
    isBetaEnabled: isBetaEnabled,
};
