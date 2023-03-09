import lodashGet from 'lodash/get';

/**
 * Get the default state for input fields in the VBA flow
 *
 * @param {Object} reimbursementAccount
 * @param {String} fieldName
 * @param {*} defaultValue
 *
 * @returns {*}
 */
function getDefaultStateForField(reimbursementAccount, fieldName, defaultValue = '') {
    return lodashGet(reimbursementAccount, ['achData', fieldName], defaultValue);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getDefaultStateForField,
};
