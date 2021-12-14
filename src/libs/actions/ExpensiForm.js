import Onyx from 'react-native-onyx';

/**
 * @param {String} formName
 * @param {Object} draft
 */
function saveFormDraft(formName, draft) {
    Onyx.merge(formName, draft);
}

function setLoading(formName, state) {
    Onyx.merge(formName, {loading: state});
}

export {
    saveFormDraft,
    setLoading,
};
