"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
function getValuesForBeneficialOwner(beneficialOwnerBeingModifiedID, reimbursementAccountDraft) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!reimbursementAccountDraft) {
        return {
            firstName: '',
            lastName: '',
            dob: '',
            ssnLast4: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
        };
    }
    var beneficialOwnerPrefix = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;
    var beneficialOwnerInfoKey = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
    var INPUT_KEYS = {
        firstName: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.FIRST_NAME),
        lastName: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.LAST_NAME),
        dob: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.DOB),
        ssnLast4: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.SSN_LAST_4),
        street: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.STREET),
        city: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.CITY),
        state: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.STATE),
        zipCode: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.ZIP_CODE),
    };
    return {
        firstName: String((_a = reimbursementAccountDraft[INPUT_KEYS.firstName]) !== null && _a !== void 0 ? _a : ''),
        lastName: String((_b = reimbursementAccountDraft[INPUT_KEYS.lastName]) !== null && _b !== void 0 ? _b : ''),
        dob: String((_c = reimbursementAccountDraft[INPUT_KEYS.dob]) !== null && _c !== void 0 ? _c : ''),
        ssnLast4: String((_d = reimbursementAccountDraft[INPUT_KEYS.ssnLast4]) !== null && _d !== void 0 ? _d : ''),
        street: String((_e = reimbursementAccountDraft[INPUT_KEYS.street]) !== null && _e !== void 0 ? _e : ''),
        city: String((_f = reimbursementAccountDraft[INPUT_KEYS.city]) !== null && _f !== void 0 ? _f : ''),
        state: String((_g = reimbursementAccountDraft[INPUT_KEYS.state]) !== null && _g !== void 0 ? _g : ''),
        zipCode: String((_h = reimbursementAccountDraft[INPUT_KEYS.zipCode]) !== null && _h !== void 0 ? _h : ''),
    };
}
exports.default = getValuesForBeneficialOwner;
