"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WalletAdditionalDetailsForm_1 = require("@src/types/form/WalletAdditionalDetailsForm");
var personalInfoKeys = WalletAdditionalDetailsForm_1.default.PERSONAL_INFO_STEP;
/**
 * Returns the initial substep for the Personal Info step based on already existing data
 */
function getInitialSubstepForPersonalInfo(data) {
    if (data[personalInfoKeys.FIRST_NAME] === '' || data[personalInfoKeys.LAST_NAME] === '') {
        return 0;
    }
    if (data[personalInfoKeys.DOB] === '') {
        return 1;
    }
    if (data[personalInfoKeys.STREET] === '' || data[personalInfoKeys.CITY] === '' || data[personalInfoKeys.STATE] === '' || data[personalInfoKeys.ZIP_CODE] === '') {
        return 2;
    }
    if (data[personalInfoKeys.PHONE_NUMBER] === '') {
        return 3;
    }
    if (data[personalInfoKeys.SSN_LAST_4] === '') {
        return 4;
    }
    return 5;
}
exports.default = getInitialSubstepForPersonalInfo;
