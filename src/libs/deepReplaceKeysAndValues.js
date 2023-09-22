import _ from 'underscore';

/**
 * @param {Object|String|number|boolean} obj the object to transform
 * @param {String} oldVal the value to search for
 * @param {String} newVal the replacement value
 * @returns {Object|String|number|boolean}
 */
function deepReplaceKeysAndValues(obj, oldVal, newVal) {
    if (!obj) {
        return obj;
    }

    if (typeof obj === 'string') {
        return obj.replace(oldVal, newVal);
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (_.isArray(obj)) {
        return _.map(obj, (item) => deepReplaceKeysAndValues(item, oldVal, newVal));
    }

    const newObj = {};
    _.each(obj, (value, key) => {
        // eslint-disable-next-line eqeqeq
        let newKey = key == oldVal ? newVal : key;
        if (_.isString(newKey)) {
            newKey = newKey.replace(oldVal, newVal);
        }

        if (_.isObject(value)) {
            newObj[newKey] = deepReplaceKeysAndValues(value, oldVal, newVal);
            return;
        }
        // eslint-disable-next-line eqeqeq
        if (value == oldVal) {
            newObj[newKey] = newVal;
            return;
        }
        if (_.isString(value)) {
            newObj[newKey] = value.replace(oldVal, newVal);
            return;
        }
        newObj[newKey] = value;
    });
    return newObj;
}

export default deepReplaceKeysAndValues;
