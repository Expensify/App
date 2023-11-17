import CONST from '@src/CONST';

/**
 * Returns the initial substep for the Personal Info step based on already existing data
 * @param {Object} data object that stores personal info data
 * @returns {number}
 */
function getInitialSubstepForPersonalInfo(data) {
    if (data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME] === '' && data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME] === '') {
        return 0;
    }

    if (data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB] === '') {
        return 1;
    }

    if (data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4] === '') {
        return 2;
    }

    if (
        data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET] === '' ||
        data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY] === '' ||
        data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE] === '' ||
        data[CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE] === ''
    ) {
        return 3;
    }

    return 4;
}

export default getInitialSubstepForPersonalInfo;
