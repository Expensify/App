"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSubstepValues(inputKeys, walletAdditionalDetailsDraft, walletAdditionalDetails) {
    return Object.entries(inputKeys).reduce(function (acc, _a) {
        var _b, _c;
        var value = _a[1];
        acc[value] = (_c = (_b = walletAdditionalDetailsDraft === null || walletAdditionalDetailsDraft === void 0 ? void 0 : walletAdditionalDetailsDraft[value]) !== null && _b !== void 0 ? _b : walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[value]) !== null && _c !== void 0 ? _c : '';
        return acc;
    }, {});
}
exports.default = getSubstepValues;
