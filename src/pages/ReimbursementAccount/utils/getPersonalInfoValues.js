import lodashGet from 'lodash/get';
import CONST from '../../../CONST';

/**
 * Returns values for personal info step
 *
 * @param {Object} reimbursementAccountDraft object that stores personal info draft data
 *
 * @param {Object} reimbursementAccount object that stores personal info data
 *
 * @returns {Object}
 */
function getPersonalInfoValues(reimbursementAccountDraft, reimbursementAccount) {
    return {
        [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME]:
            lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME, '') ||
            lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME], ''),
        [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME]:
            lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME, '') ||
            lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME], ''),
        [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB]:
            lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB, '') ||
            lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB], ''),
        [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4]:
            lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4, '') ||
            lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4], ''),
        [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET]:
            lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET, '') ||
            lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET], ''),
        [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY]:
            lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY, '') ||
            lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY], ''),
        [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE]:
            lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE, '') ||
            lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE], ''),
        [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE]:
            lodashGet(reimbursementAccountDraft, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE, '') ||
            lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE], ''),
    };
}

export default getPersonalInfoValues;
