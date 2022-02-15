import Onyx from 'react-native-onyx';

/**
 * @param {String} formID
 * @param {Boolean} isSubmitting
 */
function setIsSubmitting(formID, isSubmitting) {
    Onyx.merge(formID, {isSubmitting});
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
    setIsSubmitting,
    setServerErrorMessage,
    setDraftValues,
};
