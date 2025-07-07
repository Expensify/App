"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getInputKeysForBankInfoStep(corpayFields) {
    var _a;
    var keys = {};
    (_a = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.formFields) === null || _a === void 0 ? void 0 : _a.forEach(function (field) {
        keys[field.id] = field.id;
    });
    return keys;
}
exports.default = getInputKeysForBankInfoStep;
