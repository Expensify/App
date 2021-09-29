import _ from 'underscore';
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
 * TODO: Fix documentation!
 * Returns a modified version of @object without mutating the original. @value null clears the value (thanks Onyx)
 * @param {Object} object
 * @param {String} path
 * @param {any} value
 * @return {Object}
 */
function updateObject(object, path, value = null) {
    const pathSections = path.split('.');
    const updatedObject = {...object};
    let lastUpdatedSections = updatedObject;
    for (let index = 0; index < pathSections.length; index++) {
        const pathSection = pathSections[index];
        const lastSection = index === pathSections.length - 1;

        if (lastSection) {
            lastUpdatedSections[pathSection] = value;
        } else if (_.isArray(lastUpdatedSections[pathSection])) { // traversing
            // Copy current level
            lastUpdatedSections[pathSection] = [...lastUpdatedSections[pathSection]];

            // Move deeper
            lastUpdatedSections = lastUpdatedSections[pathSection];
        } else if (_.isObject(lastUpdatedSections[pathSection])) {
            // Copy current level
            lastUpdatedSections[pathSection] = {...lastUpdatedSections[pathSection]};

            // Move deeper
            lastUpdatedSections = lastUpdatedSections[pathSection];
        } else {
            console.error('Unhandled type', lastUpdatedSections, path, value, index, pathSection);
        }
    }
    return updatedObject;
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

    const newErrors = updateObject(errors, path, null);
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
