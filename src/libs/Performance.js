import _ from 'underscore';
import lodashTransform from 'lodash/transform';

/**
 * Deep diff between two objects. Useful for figuring out what changed about an object from one render to the next so
 * that state and props updates can be optimized.
 *
 * @param  {Object} object
 * @param  {Object} base
 * @return {Object}
 */
function diffObject(object, base) {
    function changes(obj, comparisonObject) {
        return lodashTransform(obj, (result, value, key) => {
            if (!_.isEqual(value, comparisonObject[key])) {
                // eslint-disable-next-line no-param-reassign
                result[key] = (
                    _.isObject(value) && _.isObject(comparisonObject[key]))
                    ? changes(value, comparisonObject[key])
                    : value;
            }
        });
    }
    return changes(object, base);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    diffObject,
};
