import lodashGet from 'lodash/get';

/**
 * @param {Object} reimbursementAccount
 * @param {String} fieldName
 * @param {* | undefined} defaultValue
 * @returns {String}
 */
function getDefaultValueForReimbursementAccountField(reimbursementAccount, fieldName, defaultValue = '') {
    return lodashGet(reimbursementAccount, ['achData', fieldName], defaultValue);
}

export default getDefaultValueForReimbursementAccountField;
