import Onyx from 'react-native-onyx';
import FormUtils from '@libs/FormUtils';

/**
 * @param {String} formID
 * @param {Boolean} isLoading
 */
function setIsLoading(formID, isLoading) {
    Onyx.merge(formID, {isLoading});
}

/**
 * @param {String} formID
 * @param {Object} errors
 */
function setErrors(formID, errors) {
    Onyx.merge(formID, {errors});
}

/**
 * @param {String} formID
 * @param {Object} errorFields
 */
function setErrorFields(formID, errorFields) {
    Onyx.merge(formID, {errorFields});
}

/**
 * @param {String} formID
 * @param {Object} draftValues
 */
function setDraftValues(formID, draftValues) {
    Onyx.merge(FormUtils.getDraftKey(formID), draftValues);
}

/**
 * @param {String} formID
 */
function clearDraftValues(formID) {
    Onyx.merge(FormUtils.getDraftKey(formID), undefined);
}

export {setIsLoading, setErrors, setErrorFields, setDraftValues, clearDraftValues};
