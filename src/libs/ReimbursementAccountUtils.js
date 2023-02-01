import lodashGet from 'lodash/get';

/**
 * Get the default state for input fields in the VBA flow
 *
 * @param {Object} reimbursementAccountDraft
 * @param {Object} reimbursementAccount
 * @param {String} fieldName
 * @param {*} defaultValue
 *
 * @returns {*}
 */
function getDefaultStateForField(reimbursementAccountDraft, reimbursementAccount, fieldName, defaultValue = '') {
    return lodashGet(reimbursementAccountDraft, fieldName)
        || lodashGet(reimbursementAccount, ['achData', fieldName], defaultValue);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getDefaultStateForField,
};
