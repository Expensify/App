import Onyx from 'react-native-onyx';

/**
 * @param {String} formName
 * @param {Boolean} isSubmitting
 */
function setIsSubmitting(formName, isSubmitting) {
    Onyx.merge(formName, {isSubmitting});
}

/**
 * @param {String} formName
 * @param {Boolean} serverErrorMessage
 */
function setServerErrorMessage(formName, serverErrorMessage) {
    Onyx.merge(formName, {serverErrorMessage});
}

/**
 * @param {String} formName
 * @param {Object} draftValues
 */
function setDraftValues(formName, draftValues) {
    Onyx.merge(`${formName}DraftValues`, draftValues);
}

export {
    setIsSubmitting,
    setServerErrorMessage,
    setDraftValues,
};
