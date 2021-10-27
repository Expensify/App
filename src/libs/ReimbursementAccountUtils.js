import lodashGet from 'lodash/get';
import lodashUnset from 'lodash/unset';
import lodashCloneDeep from 'lodash/cloneDeep';
// eslint-disable-next-line import/no-cycle
import {setBankAccountFormValidationErrors} from './actions/BankAccounts';

/**
 * @param {Object} reimbursementAccountDraft
 * @param {Object} achData
 * @param {String} fieldName
 * @param {*} defaultValue
 * @returns {*}
 */
function getDefaultStateForField(reimbursementAccountDraft, achData, fieldName, defaultValue = '') {
    return lodashGet(reimbursementAccountDraft, [fieldName])
        || lodashGet(achData, [fieldName], defaultValue);
}

function getRequestorIdentity(reimbursementAccountDraft, achData) {
    return {
        firstName: getDefaultStateForField(reimbursementAccountDraft, achData, 'firstName'),
        lastName: getDefaultStateForField(reimbursementAccountDraft, achData, 'lastName'),
        requestorAddressStreet: getDefaultStateForField(reimbursementAccountDraft, achData, 'requestorAddressStreet'),
        requestorAddressCity: getDefaultStateForField(reimbursementAccountDraft, achData, 'requestorAddressCity'),
        requestorAddressState: getDefaultStateForField(reimbursementAccountDraft, achData, 'requestorAddressState'),
        requestorAddressZipCode: getDefaultStateForField(reimbursementAccountDraft, achData, 'requestorAddressZipCode'),
        dob: getDefaultStateForField(reimbursementAccountDraft, achData, 'dob'),
        ssnLast4: getDefaultStateForField(reimbursementAccountDraft, achData, 'ssnLast4'),
        isControllingOfficer: getDefaultStateForField(reimbursementAccountDraft, achData, 'isControllingOfficer', false),
    };
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
 * @param {String} path
 */
function clearError(props, path) {
    const errors = getErrors(props);
    if (!lodashGet(errors, path, false)) {
        // No error found for this path
        return;
    }

    // Clear the existing errors
    const newErrors = lodashCloneDeep(errors);
    lodashUnset(newErrors, path);
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
    getRequestorIdentity,
    getErrors,
    clearError,
    getErrorText,
};
