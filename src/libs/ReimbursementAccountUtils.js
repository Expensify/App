import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as BankAccounts from './actions/BankAccounts';
import FormHelper from './FormHelper';

const formHelper = new FormHelper({
    errorPath: 'reimbursementAccount.errorFields',
    setErrors: BankAccounts.setBankAccountFormValidationErrors,
});

const getErrors = props => formHelper.getErrors(props);
const clearError = (props, path) => formHelper.clearError(props, path);
const clearErrors = (props, paths) => formHelper.clearErrors(props, paths);

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

/**
 * @param {Object} props
 * @param {Object} errorTranslationKeys
 * @param {String} inputKey
 * @returns {String}
 */
function getErrorText(props, errorTranslationKeys, inputKey) {
    const errors = getErrors(props) || {};
    return errors[inputKey] ? props.translate(errorTranslationKeys[inputKey]) : '';
}

export {
    getDefaultStateForField,
    getErrors,
    clearError,
    clearErrors,
    getErrorText,
    getBankAccountFields,
};
