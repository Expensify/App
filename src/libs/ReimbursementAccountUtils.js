import _ from 'underscore';
import lodashGet from 'lodash/get';

/**
 * Get the default state for input fields in the VBA flow
 *
 * @param {Object} props
 * @param {String} fieldName
 * @param {*} defaultValue
 *
 * @returns {*}
 */
function getDefaultStateForField(props, fieldName, defaultValue = '') {
    return lodashGet(props, ['reimbursementAccountDraft', fieldName])
        || lodashGet(props, ['reimbursementAccount', 'achData', fieldName], defaultValue);
}

/**
 * @param {Object} props
 * @param {Array} fieldNames
 *
 * @returns {*}
 */
function getBankAccountFields(props, fieldNames) {
    return {
        ..._.pick(lodashGet(props, 'reimbursementAccount.achData'), ...fieldNames),
        ..._.pick(props.reimbursementAccountDraft, ...fieldNames),
    };
}

export {
    getDefaultStateForField,
    getBankAccountFields,
};
