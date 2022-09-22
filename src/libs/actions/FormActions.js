import Onyx from 'react-native-onyx';

/**
 * @param {String} formID
 * @param {Boolean} isLoading
 */
function setIsLoading(formID, isLoading) {
    Onyx.merge(formID, {isLoading});
}

/**
 * @param {String} formID
 * @param {String} error
 */
function setErrorMessage(formID, error) {
    Onyx.merge(formID, {error});
}

/**
 * @param {String} formID
 * @param {String} errors
 */
function setErrors(formID, errors) {
    Onyx.merge(formID, {errors});
}

/**
 * @param {String} formID
 * @param {Object} draftValues
 */
function setDraftValues(formID, draftValues) {
    Onyx.merge(`${formID}DraftValues`, draftValues);
}

export {
    setIsLoading,
    setErrorMessage,
    setErrors,
    setDraftValues,
};
