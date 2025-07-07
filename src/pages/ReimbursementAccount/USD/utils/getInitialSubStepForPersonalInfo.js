"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var personalInfoKeys = ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP;
/**
 * Returns the initial subStep for the Personal Info step based on already existing data
 */
function getInitialSubStepForPersonalInfo(data) {
    if (data[personalInfoKeys.FIRST_NAME] === '' || data[personalInfoKeys.LAST_NAME] === '') {
        return 0;
    }
    if (data[personalInfoKeys.DOB] === '') {
        return 1;
    }
    if (data[personalInfoKeys.SSN_LAST_4] === '') {
        return 2;
    }
    if (data[personalInfoKeys.STREET] === '' || data[personalInfoKeys.CITY] === '' || data[personalInfoKeys.STATE] === '' || data[personalInfoKeys.ZIP_CODE] === '') {
        return 3;
    }
    return 4;
}
exports.default = getInitialSubStepForPersonalInfo;
