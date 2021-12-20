import lodashGet from 'lodash/get';
import lodashUnset from 'lodash/unset';
import lodashCloneDeep from 'lodash/cloneDeep';

class FormHelper {
    constructor({errorPath, setErrors}) {
        this.errorPath = errorPath;
        this.setErrors = setErrors;
    }

    /**
     * @param {Object} props
     * @returns {Object}
     */
    getErrors(props) {
        return lodashGet(props, this.errorPath, {});
    }

    /**
     * @param {Object} props
     * @param {String} path
     */
    clearError(props, path) {
        const errors = this.getErrors(props);
        if (!lodashGet(errors, path, false)) {
            // No error found for this path
            return;
        }

        // Clear the existing errors
        const newErrors = lodashCloneDeep(errors);
        lodashUnset(newErrors, path);
        this.setErrors(newErrors);
    }
}

export default FormHelper;
