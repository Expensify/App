import CONST from '@src/CONST';

/**
 * Returns the initial substep for the Personal Info step based on already existing data
 *
 * @param {Object} data object that stores personal info data
 *
 * @returns {number}
 */
function getInitialSubstepForPersonalInfo(data) {
    if (data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME] === undefined && data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME] === undefined) {
        return 0;
    }

    if (data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB] === undefined) {
        return 1;
    }

    if (data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4] === undefined) {
        return 2;
    }

    if (
        data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET] === undefined ||
        data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY] === undefined ||
        data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE] === undefined ||
        data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE] === undefined
    ) {
        return 3;
    }

    return 4;
}

export default getInitialSubstepForPersonalInfo;
