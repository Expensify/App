import lodashGet from 'lodash/get';
import lodashUnset from 'lodash/unset';
import lodashCloneDeep from 'lodash/cloneDeep';

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
 * Use this function binding it to a component's instance
 * @returns {Object}
 */
function getErrors() {
    return this.state.errors || {};
}

/**
 * Use this function binding it to a component's instance
 * @param {String} path
 */
function clearError(path) {
    const errors = this.state.errors || {};
    if (!lodashGet(errors, path, false)) {
        // No error found for this path
        return;
    }

    this.setState((prevState) => {
        // Clear the existing errors
        const newErrors = lodashCloneDeep(prevState.errors);
        lodashUnset(newErrors, path);
        return {...prevState, errors: newErrors};
    });
}

/**
 * Use this function binding it to a component's instance
 * @param {Object} errorTranslationKeys
 * @param {String} inputKey
 * @returns {String}
 */
function getErrorText(errorTranslationKeys, inputKey) {
    const errors = this.state.errors || {};
    return errors[inputKey] ? this.props.translate(errorTranslationKeys[inputKey]) : '';
}

/**
 * Use this function binding it to a component's instance
 * @param {Object} errors
 */
function setErrors(errors) {
    this.setState({errors});
}

export {
    getDefaultStateForField,
    getErrors,
    clearError,
    getErrorText,
    setErrors,
};
