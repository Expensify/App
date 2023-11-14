import CONST from '@src/CONST';

/**
 * Returns the initial substep for the Bank Info step based on already existing data
 * @param {Object} data object that stores bank info data
 * @param {string} setupType type of setup
 * @returns {number}
 */
function getInitialSubstepForBankInfo(data, setupType) {
    if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
        if (data[CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY.ACCOUNT_NUMBER] === '' || data[CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY.ROUTING_NUMBER] === '') {
            return 0;
        }

        return 1;
    }

    if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
        if (data[CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY.BANK_NAME] === '') {
            return 0;
        }

        return 1;
    }
}

export default getInitialSubstepForBankInfo;
