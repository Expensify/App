import _ from 'underscore';
import lodashGet from 'lodash/get';
import lodashUnset from 'lodash/unset';
import lodashCloneDeep from 'lodash/cloneDeep';

class FormHelper {
    constructor({errorPath, setErrors}) {
        this.errorPath = errorPath;
        this.setErrors = setErrors;
        this.getErrors = this.getErrors.bind(this);
        this.clearError = this.clearError.bind(this);
        this.clearErrors = this.clearErrors.bind(this);
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
     * @param {String[]} paths
     */
    clearErrors(props, paths) {
        const errors = this.getErrors(props);
        const pathsWithErrors = _.filter(paths, path => lodashGet(errors, path, false));
        if (_.size(pathsWithErrors) === 0) {
            // No error found for this path
            return;
        }

        // Clear the existing errors
        const newErrors = lodashCloneDeep(errors);
        _.forEach(pathsWithErrors, path => lodashUnset(newErrors, path));
        this.setErrors(newErrors);
    }

    /**
     * @param {Object} props
     * @param {String} path
     */
    clearError(props, path) {
        this.clearErrors(props, [path]);
    }
}

export default FormHelper;
