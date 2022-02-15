/**
 * Custom prop validator that enforces inputID as a required string if isFormInput is true
 *
 * @param {Object} props - props passed to the input component
 * @returns {Object} returns an Error object if isFormInput is supplied but inputID is falsey or not a string
 */
function validateInputIDProps(props) {
    if (!props.isFormInput) {
        return;
    }
    if (!props.inputID) {
        return new Error('InputID is required if isFormInput is true');
    }
    if (typeof props.inputID !== 'string') {
        return new Error(`Invalid prop type ${typeof props.inputID} supplied to inputID. Expecting string.`);
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    validateInputIDProps,
};
