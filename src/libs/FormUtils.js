/**
 * Gets the prop type for inputID
 *
 * @param {Object} props - props passed to the input component
 * @returns {Object} returns an Error object if isFormInput is supplied but inputID is falsey or not a string
 */
function getInputIDPropTypes(props) {
    if (!props.isFormInput) {
        return;
    }
    if (!props.inputID) {
        return new Error('InputID is required if isFormInput prop is supplied.');
    }
    if (typeof props.inputID !== 'string') {
        return new Error(`Invalid prop type ${typeof props.inputID} supplied to inputID. Expecting string.`);
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getInputIDPropTypes,
};
