"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
function getValuesForSignerInfo(reimbursementAccountDraft) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    if (!reimbursementAccountDraft) {
        return {
            dateOfBirth: '',
            fullName: '',
            jobTitle: '',
            city: '',
            state: '',
            street: '',
            zipCode: '',
            proofOfDirectors: [],
            copyOfId: [],
            addressProof: [],
            codiceFiscale: [],
            downloadedPdsAndFSG: false,
        };
    }
    var signerInfoKeys = CONST_1.default.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;
    return {
        dateOfBirth: (_a = reimbursementAccountDraft[signerInfoKeys.DATE_OF_BIRTH]) !== null && _a !== void 0 ? _a : '',
        fullName: (_b = reimbursementAccountDraft[signerInfoKeys.FULL_NAME]) !== null && _b !== void 0 ? _b : '',
        jobTitle: (_c = reimbursementAccountDraft[signerInfoKeys.JOB_TITLE]) !== null && _c !== void 0 ? _c : '',
        city: (_d = reimbursementAccountDraft[signerInfoKeys.CITY]) !== null && _d !== void 0 ? _d : '',
        state: (_e = reimbursementAccountDraft[signerInfoKeys.STATE]) !== null && _e !== void 0 ? _e : '',
        street: (_f = reimbursementAccountDraft[signerInfoKeys.STREET]) !== null && _f !== void 0 ? _f : '',
        zipCode: (_g = reimbursementAccountDraft[signerInfoKeys.ZIP_CODE]) !== null && _g !== void 0 ? _g : '',
        proofOfDirectors: (_h = reimbursementAccountDraft[signerInfoKeys.PROOF_OF_DIRECTORS]) !== null && _h !== void 0 ? _h : [],
        copyOfId: (_j = reimbursementAccountDraft[signerInfoKeys.COPY_OF_ID]) !== null && _j !== void 0 ? _j : [],
        addressProof: (_k = reimbursementAccountDraft[signerInfoKeys.ADDRESS_PROOF]) !== null && _k !== void 0 ? _k : [],
        codiceFiscale: (_l = reimbursementAccountDraft[signerInfoKeys.CODICE_FISCALE]) !== null && _l !== void 0 ? _l : [],
        downloadedPdsAndFSG: (_m = reimbursementAccountDraft[signerInfoKeys.DOWNLOADED_PDS_AND_FSG]) !== null && _m !== void 0 ? _m : false,
    };
}
exports.default = getValuesForSignerInfo;
