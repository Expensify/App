import lodashGet from 'lodash/get';

/**
 * @param {Object} params
 * @param {Object} params.reimbursementAccount
 * @param {String} params.fieldName
 * @param {* | undefined} params.defaultValue
 *
 * @returns {String}
 */
function getDefaultStateForField({reimbursementAccount, fieldName, defaultValue = ''}) {
    return lodashGet(reimbursementAccount, ['achData', fieldName], defaultValue);
}

export default getDefaultStateForField;
