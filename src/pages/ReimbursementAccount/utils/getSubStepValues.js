"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSubStepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount) {
    return Object.entries(inputKeys).reduce(function (acc, _a) {
        var _b, _c, _d, _e, _f, _g;
        var value = _a[1];
        acc[value] = ((_g = (_d = (_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[value]) !== null && _b !== void 0 ? _b : (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c[value]) !== null && _d !== void 0 ? _d : (_f = (_e = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _e === void 0 ? void 0 : _e.corpay) === null || _f === void 0 ? void 0 : _f[value]) !== null && _g !== void 0 ? _g : '');
        return acc;
    }, {});
}
exports.default = getSubStepValues;
