"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var BUSINESS_INFO_STEP_KEYS = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY;
/**
 * Returns the initial subStep for the Business info step based on already existing data
 */
function getInitialSubStepForBusinessInfoStep(data) {
    if (data[BUSINESS_INFO_STEP_KEYS.COMPANY_NAME] === '') {
        return 0;
    }
    if (data[BUSINESS_INFO_STEP_KEYS.COMPANY_WEBSITE] === '') {
        return 1;
    }
    if (data[BUSINESS_INFO_STEP_KEYS.COMPANY_STREET] === '' ||
        data[BUSINESS_INFO_STEP_KEYS.COMPANY_CITY] === '' ||
        data[BUSINESS_INFO_STEP_KEYS.COMPANY_POSTAL_CODE] === '' ||
        data[BUSINESS_INFO_STEP_KEYS.COMPANY_COUNTRY_CODE] === '' ||
        ((data[BUSINESS_INFO_STEP_KEYS.COMPANY_COUNTRY_CODE] === CONST_1.default.COUNTRY.US || data[BUSINESS_INFO_STEP_KEYS.COMPANY_COUNTRY_CODE] === CONST_1.default.COUNTRY.CA) &&
            data[BUSINESS_INFO_STEP_KEYS.COMPANY_STATE] === '') ||
        (data[BUSINESS_INFO_STEP_KEYS.COMPANY_COUNTRY_CODE] === '' && data[BUSINESS_INFO_STEP_KEYS.COMPANY_STATE] === '')) {
        return 2;
    }
    if (data[BUSINESS_INFO_STEP_KEYS.BUSINESS_CONTACT_NUMBER] === '' || data[BUSINESS_INFO_STEP_KEYS.BUSINESS_CONFIRMATION_EMAIL] === '') {
        return 3;
    }
    if (data[BUSINESS_INFO_STEP_KEYS.BUSINESS_REGISTRATION_INCORPORATION_NUMBER] === '') {
        return 4;
    }
    if (data[BUSINESS_INFO_STEP_KEYS.TAX_ID_EIN_NUMBER] === '') {
        return 5;
    }
    if (data[BUSINESS_INFO_STEP_KEYS.FORMATION_INCORPORATION_COUNTRY_CODE] === '' ||
        ((data[BUSINESS_INFO_STEP_KEYS.FORMATION_INCORPORATION_COUNTRY_CODE] === CONST_1.default.COUNTRY.US ||
            data[BUSINESS_INFO_STEP_KEYS.FORMATION_INCORPORATION_COUNTRY_CODE] === CONST_1.default.COUNTRY.CA) &&
            data[BUSINESS_INFO_STEP_KEYS.FORMATION_INCORPORATION_STATE] === '')) {
        return 6;
    }
    if (data[BUSINESS_INFO_STEP_KEYS.BUSINESS_CATEGORY] === '' || data[BUSINESS_INFO_STEP_KEYS.APPLICANT_TYPE_ID] === '') {
        return 7;
    }
    if (data[BUSINESS_INFO_STEP_KEYS.ANNUAL_VOLUME] === '') {
        return 8;
    }
    if (data[BUSINESS_INFO_STEP_KEYS.TRADE_VOLUME] === '') {
        return 9;
    }
    return 10;
}
exports.default = getInitialSubStepForBusinessInfoStep;
