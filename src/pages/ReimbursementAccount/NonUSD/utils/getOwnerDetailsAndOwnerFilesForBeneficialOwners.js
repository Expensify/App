"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var _a = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA, FIRST_NAME = _a.FIRST_NAME, LAST_NAME = _a.LAST_NAME, OWNERSHIP_PERCENTAGE = _a.OWNERSHIP_PERCENTAGE, DOB = _a.DOB, SSN_LAST_4 = _a.SSN_LAST_4, STREET = _a.STREET, CITY = _a.CITY, COUNTRY = _a.COUNTRY, STATE = _a.STATE, ZIP_CODE = _a.ZIP_CODE, PROOF_OF_OWNERSHIP = _a.PROOF_OF_OWNERSHIP, COPY_OF_ID = _a.COPY_OF_ID, ADDRESS_PROOF = _a.ADDRESS_PROOF, CODICE_FISCALE = _a.CODICE_FISCALE, RESIDENTIAL_ADDRESS = _a.RESIDENTIAL_ADDRESS, FULL_NAME = _a.FULL_NAME, PREFIX = _a.PREFIX;
var ownerDetailsFields = [FIRST_NAME, LAST_NAME, OWNERSHIP_PERCENTAGE, DOB, SSN_LAST_4, STREET, CITY, STATE, ZIP_CODE, COUNTRY];
var ownerFilesFields = [PROOF_OF_OWNERSHIP, COPY_OF_ID, ADDRESS_PROOF, CODICE_FISCALE];
function getOwnerDetailsAndOwnerFilesForBeneficialOwners(ownerKeys, reimbursementAccountDraft) {
    var ownerDetails = {};
    var ownerFiles = {};
    ownerKeys.forEach(function (ownerKey) {
        var ownerDetailsFullNameKey = "".concat(PREFIX, "_").concat(ownerKey, "_").concat(FULL_NAME);
        var ownerDetailsResidentialAddressKey = "".concat(PREFIX, "_").concat(ownerKey, "_").concat(RESIDENTIAL_ADDRESS);
        var ownerDetailsNationalityKey = "".concat(PREFIX, "_").concat(ownerKey, "_").concat(COUNTRY);
        ownerDetailsFields.forEach(function (fieldName) {
            var ownerDetailsKey = "".concat(PREFIX, "_").concat(ownerKey, "_").concat(fieldName);
            if (!(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ownerDetailsKey])) {
                return;
            }
            if (fieldName === SSN_LAST_4 && String(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ownerDetailsNationalityKey]) !== CONST_1.default.COUNTRY.US) {
                return;
            }
            if (fieldName === OWNERSHIP_PERCENTAGE) {
                ownerDetails[ownerDetailsKey] = "".concat(String(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ownerDetailsKey]), "%");
                return;
            }
            if (fieldName === FIRST_NAME || fieldName === LAST_NAME) {
                ownerDetails[ownerDetailsFullNameKey] = ownerDetails[ownerDetailsFullNameKey]
                    ? "".concat(String(ownerDetails[ownerDetailsFullNameKey]), " ").concat(String(reimbursementAccountDraft[ownerDetailsKey]))
                    : reimbursementAccountDraft[ownerDetailsKey];
                return;
            }
            if (fieldName === STREET || fieldName === CITY || fieldName === STATE || fieldName === ZIP_CODE) {
                ownerDetails[ownerDetailsResidentialAddressKey] = ownerDetails[ownerDetailsResidentialAddressKey]
                    ? "".concat(String(ownerDetails[ownerDetailsResidentialAddressKey]), ", ").concat(String(reimbursementAccountDraft[ownerDetailsKey]))
                    : reimbursementAccountDraft[ownerDetailsKey];
                return;
            }
            ownerDetails[ownerDetailsKey] = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ownerDetailsKey];
        });
        ownerFilesFields.forEach(function (fieldName) {
            var ownerFilesKey = "".concat(PREFIX, "_").concat(ownerKey, "_").concat(fieldName);
            if (!(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ownerFilesKey])) {
                return;
            }
            // User can only upload one file per each field
            var uploadedFile = ((reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ownerFilesKey]) || [])[0];
            ownerFiles[ownerFilesKey] = uploadedFile;
        });
    });
    return { ownerDetails: ownerDetails, ownerFiles: ownerFiles };
}
exports.default = getOwnerDetailsAndOwnerFilesForBeneficialOwners;
