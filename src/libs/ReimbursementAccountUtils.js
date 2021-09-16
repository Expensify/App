import lodashGet from 'lodash/get';
import {setBankAccountFormValidationErrors} from './actions/BankAccounts';

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
        || lodashGet(props, ['achData', fieldName], defaultValue);
}

/**
 * @param {Object} props
 * @returns {Object}
 */
function getErrors(props) {
    return lodashGet(props, ['reimbursementAccount', 'errors'], {});
}

/**
 * @param {Object} props
 * @param {String} inputKey
 */
function clearError(props, inputKey) {
    const errors = getErrors(props);
    if (!errors[inputKey]) {
        // No error found for this inputKey
        return;
    }

    // Clear the existing error for this inputKey
    const newErrors = {...errors};
    delete newErrors[inputKey];
    setBankAccountFormValidationErrors(newErrors);
}

/**
 * @param {Object} props
 * @param {Object} errorTranslationKeys
 * @param {String} inputKey
 * @returns {String}
 */
function getErrorText(props, errorTranslationKeys, inputKey) {
    const errors = getErrors(props);
    return errors[inputKey] ? props.translate(errorTranslationKeys[inputKey]) : '';
}

export {
    getDefaultStateForField,
    getErrors,
    clearError,
    getErrorText,
};
