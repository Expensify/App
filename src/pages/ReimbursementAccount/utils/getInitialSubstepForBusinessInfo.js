import CONST from '../../../CONST';

const businessInfoStepKeys = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY;

/**
 * Returns the initial substep for the Business Info step based on already existing data
 *
 * @param {Object} data object that stores business info data
 *
 * @returns {number}
 */
function getInitialSubstepForBusinessInfo(data) {
    if (data[businessInfoStepKeys.COMPANY_NAME] === undefined) {
        return 0;
    }

    if (data[businessInfoStepKeys.COMPANY_TAX_ID] === undefined) {
        return 1;
    }

    if (data[businessInfoStepKeys.COMPANY_WEBSITE] === undefined) {
        return 2;
    }

    if (data[businessInfoStepKeys.COMPANY_PHONE] === undefined) {
        return 3;
    }

    if (
        data[businessInfoStepKeys.STREET] === undefined ||
        data[businessInfoStepKeys.CITY] === undefined ||
        data[businessInfoStepKeys.STATE] === undefined ||
        data[businessInfoStepKeys.ZIP_CODE] === undefined
    ) {
        return 4;
    }

    if (data[businessInfoStepKeys.INCORPORATION_TYPE] === undefined) {
        return 5;
    }

    if (data[businessInfoStepKeys.INCORPORATION_DATE] === undefined) {
        return 6;
    }

    if (data[businessInfoStepKeys.INCORPORATION_STATE] === undefined) {
        return 7;
    }

    return 8;
}

export default getInitialSubstepForBusinessInfo;
