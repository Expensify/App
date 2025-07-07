"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var _a = CONST_1.default.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA, FULL_NAME = _a.FULL_NAME, EMAIL = _a.EMAIL, JOB_TITLE = _a.JOB_TITLE, DATE_OF_BIRTH = _a.DATE_OF_BIRTH, ADDRESS = _a.ADDRESS, STREET = _a.STREET, CITY = _a.CITY, STATE = _a.STATE, ZIP_CODE = _a.ZIP_CODE, PROOF_OF_DIRECTORS = _a.PROOF_OF_DIRECTORS, ADDRESS_PROOF = _a.ADDRESS_PROOF, COPY_OF_ID = _a.COPY_OF_ID, CODICE_FISCALE = _a.CODICE_FISCALE, DOWNLOADED_PDS_AND_FSG = _a.DOWNLOADED_PDS_AND_FSG;
var _b = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA, BENEFICIAL_PREFIX = _b.PREFIX, FIRST_NAME = _b.FIRST_NAME, LAST_NAME = _b.LAST_NAME, DOB = _b.DOB, BENEFICIAL_STREET = _b.STREET, BENEFICIAL_CITY = _b.CITY, BENEFICIAL_STATE = _b.STATE, BENEFICIAL_ZIP_CODE = _b.ZIP_CODE;
var signerDetailsFields = [FULL_NAME, EMAIL, JOB_TITLE, DATE_OF_BIRTH, STREET, CITY, STATE, ZIP_CODE, DOWNLOADED_PDS_AND_FSG];
var signerFilesFields = [PROOF_OF_DIRECTORS, ADDRESS_PROOF, COPY_OF_ID, CODICE_FISCALE];
var beneficialOwnerFields = [FIRST_NAME, LAST_NAME, DOB, BENEFICIAL_STREET, BENEFICIAL_CITY, BENEFICIAL_STATE, BENEFICIAL_ZIP_CODE];
function getSignerDetailsAndSignerFilesForSignerInfo(reimbursementAccountDraft, signerEmail, isUserBeneficialOwner) {
    var signerDetails = {};
    var signerFiles = {};
    signerDetailsFields.forEach(function (fieldName) {
        if (fieldName === EMAIL) {
            signerDetails[fieldName] = signerEmail;
            return;
        }
        if (fieldName === DOWNLOADED_PDS_AND_FSG) {
            // hardcoded "true" temporarily - it will be handled properly in separate PR
            signerDetails[fieldName] = true;
        }
        if (!(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[fieldName])) {
            return;
        }
        if (fieldName === STREET || fieldName === CITY || fieldName === STATE || fieldName === ZIP_CODE) {
            signerDetails[ADDRESS] = signerDetails[ADDRESS] ? "".concat(String(signerDetails[ADDRESS]), ", ").concat(String(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[fieldName])) : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[fieldName];
            return;
        }
        signerDetails[fieldName] = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[fieldName];
    });
    if (isUserBeneficialOwner) {
        signerDetails[FULL_NAME] = '';
        signerDetails[DATE_OF_BIRTH] = '';
        signerDetails[ADDRESS] = '';
        beneficialOwnerFields.forEach(function (fieldName) {
            var beneficialFieldKey = "".concat(BENEFICIAL_PREFIX, "_").concat(CONST_1.default.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY, "_").concat(fieldName);
            if (fieldName === FIRST_NAME || fieldName === LAST_NAME) {
                signerDetails[FULL_NAME] = signerDetails[FULL_NAME]
                    ? "".concat(String(signerDetails[FULL_NAME]), " ").concat(String(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[beneficialFieldKey]))
                    : String(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[beneficialFieldKey]);
                return;
            }
            if (fieldName === DOB) {
                signerDetails[DATE_OF_BIRTH] = String(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[beneficialFieldKey]);
                return;
            }
            if (fieldName === BENEFICIAL_STREET || fieldName === BENEFICIAL_CITY || fieldName === BENEFICIAL_STATE || fieldName === BENEFICIAL_ZIP_CODE) {
                signerDetails[ADDRESS] = signerDetails[ADDRESS]
                    ? "".concat(String(signerDetails[ADDRESS]), ", ").concat(String(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[beneficialFieldKey]))
                    : String(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[beneficialFieldKey]);
            }
        });
    }
    signerFilesFields.forEach(function (fieldName) {
        if (!(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[fieldName])) {
            return;
        }
        // eslint-disable-next-line rulesdir/prefer-at
        signerFiles[fieldName] = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[fieldName][0];
    });
    return { signerDetails: signerDetails, signerFiles: signerFiles };
}
exports.default = getSignerDetailsAndSignerFilesForSignerInfo;
