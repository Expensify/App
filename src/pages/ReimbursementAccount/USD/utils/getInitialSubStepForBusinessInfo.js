"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var businessInfoStepKeys = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP;
/**
 * Returns the initial subStep for the Business Info step based on already existing data
 */
function getInitialSubStepForBusinessInfo(data) {
    if (data[businessInfoStepKeys.COMPANY_NAME] === '') {
        return 0;
    }
    if (data[businessInfoStepKeys.COMPANY_TAX_ID] === '') {
        return 1;
    }
    if (!(0, ValidationUtils_1.isValidWebsite)(expensify_common_1.Str.sanitizeURL(data[businessInfoStepKeys.COMPANY_WEBSITE], CONST_1.default.COMPANY_WEBSITE_DEFAULT_SCHEME))) {
        return 2;
    }
    if (data[businessInfoStepKeys.COMPANY_PHONE] === '') {
        return 3;
    }
    if (data[businessInfoStepKeys.STREET] === '' || data[businessInfoStepKeys.CITY] === '' || data[businessInfoStepKeys.STATE] === '' || data[businessInfoStepKeys.ZIP_CODE] === '') {
        return 4;
    }
    if (data[businessInfoStepKeys.INCORPORATION_TYPE] === '') {
        return 5;
    }
    if (data[businessInfoStepKeys.INCORPORATION_DATE] === '') {
        return 6;
    }
    if (data[businessInfoStepKeys.INCORPORATION_STATE] === '') {
        return 7;
    }
    if (data[businessInfoStepKeys.INCORPORATION_CODE] === '') {
        return 8;
    }
    return 9;
}
exports.default = getInitialSubStepForBusinessInfo;
