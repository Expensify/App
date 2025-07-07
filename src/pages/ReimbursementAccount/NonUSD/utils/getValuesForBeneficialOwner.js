"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
function getValuesForOwner(beneficialOwnerBeingModifiedID, reimbursementAccountDraft) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    if (!reimbursementAccountDraft) {
        return {
            firstName: '',
            lastName: '',
            ownershipPercentage: '',
            dob: '',
            ssnLast4: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            proofOfOwnership: [],
            copyOfID: [],
            addressProof: [],
            codiceFiscale: [],
        };
    }
    var beneficialOwnerPrefix = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;
    var beneficialOwnerInfoKey = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
    var INPUT_KEYS = {
        firstName: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.FIRST_NAME),
        lastName: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.LAST_NAME),
        ownershipPercentage: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.OWNERSHIP_PERCENTAGE),
        dob: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.DOB),
        ssnLast4: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.SSN_LAST_4),
        street: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.STREET),
        city: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.CITY),
        state: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.STATE),
        zipCode: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.ZIP_CODE),
        country: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.COUNTRY),
        proofOfOwnership: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.PROOF_OF_OWNERSHIP),
        copyOfID: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.COPY_OF_ID),
        addressProof: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.ADDRESS_PROOF),
        codiceFiscale: "".concat(beneficialOwnerPrefix, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(beneficialOwnerInfoKey.CODICE_FISCALE),
    };
    return {
        firstName: (_a = reimbursementAccountDraft[INPUT_KEYS.firstName]) !== null && _a !== void 0 ? _a : '',
        lastName: (_b = reimbursementAccountDraft[INPUT_KEYS.lastName]) !== null && _b !== void 0 ? _b : '',
        ownershipPercentage: (_c = reimbursementAccountDraft[INPUT_KEYS.ownershipPercentage]) !== null && _c !== void 0 ? _c : '',
        dob: (_d = reimbursementAccountDraft[INPUT_KEYS.dob]) !== null && _d !== void 0 ? _d : '',
        ssnLast4: (_e = reimbursementAccountDraft[INPUT_KEYS.ssnLast4]) !== null && _e !== void 0 ? _e : '',
        street: (_f = reimbursementAccountDraft[INPUT_KEYS.street]) !== null && _f !== void 0 ? _f : '',
        city: (_g = reimbursementAccountDraft[INPUT_KEYS.city]) !== null && _g !== void 0 ? _g : '',
        state: (_h = reimbursementAccountDraft[INPUT_KEYS.state]) !== null && _h !== void 0 ? _h : '',
        zipCode: (_j = reimbursementAccountDraft[INPUT_KEYS.zipCode]) !== null && _j !== void 0 ? _j : '',
        country: (_k = reimbursementAccountDraft[INPUT_KEYS.country]) !== null && _k !== void 0 ? _k : '',
        proofOfOwnership: (_l = reimbursementAccountDraft[INPUT_KEYS.proofOfOwnership]) !== null && _l !== void 0 ? _l : [],
        copyOfID: (_m = reimbursementAccountDraft[INPUT_KEYS.copyOfID]) !== null && _m !== void 0 ? _m : [],
        addressProof: (_o = reimbursementAccountDraft[INPUT_KEYS.addressProof]) !== null && _o !== void 0 ? _o : [],
        codiceFiscale: (_p = reimbursementAccountDraft[INPUT_KEYS.codiceFiscale]) !== null && _p !== void 0 ? _p : [],
    };
}
exports.default = getValuesForOwner;
