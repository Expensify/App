import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as BankAccounts from './actions/BankAccounts';
import FormHelper from './FormHelper';

const formHelper = new FormHelper({
    errorPath: 'reimbursementAccount.errors',
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
        || lodashGet(props, ['achData', fieldName], defaultValue);
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

/**
 * Helper method to get the onfido sdk token from the bank account's achdata
 *
 * @param {Object} achData
 * @returns {string}
 */
function getOnfidoSDKTokenFromACHData(achData) {
    const sdkToken = _.get(achData, ['verifications', 'externalApiResponses', 'requestorIdentityOnfido', 'apiResult', 'sdkToken'], '');
    return sdkToken || _.get(achData, ['sdkToken'], '');
}

export {
    getDefaultStateForField,
    getErrors,
    clearError,
    clearErrors,
    getErrorText,
    getOnfidoSDKTokenFromACHData,
};
