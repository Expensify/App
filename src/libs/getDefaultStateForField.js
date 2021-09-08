import lodashGet from 'lodash/get';

/**
 * Add / to the end of any URL if not present
 * @param {Object} props
 * @param {String} fieldName
 * @param {*} defaultValue
 *
 * @returns {*}
 */
function getDefaultStateForField(props, fieldName, defaultValue = '') {
    return lodashGet(props, ['reimbursementAccountDraft', fieldName]) 
        || lodashGet(props, ['achData', fieldName], defaultValue);
}

export default getDefaultStateForField;
