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
 * @param {Boolean} serverErrorMessage
 */
function setServerErrorMessage(formID, serverErrorMessage) {
    Onyx.merge(formID, {serverErrorMessage});
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
    setServerErrorMessage,
    setDraftValues,
};
