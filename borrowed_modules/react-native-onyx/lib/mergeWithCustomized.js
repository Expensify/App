import lodashMergeWith from 'lodash/mergeWith';

/**
 * When merging 2 objects into onyx that contain an array, we want to completely replace the array instead of the default
 * behavior which is to merge each item by its index.
 * ie:
 * merge({a: [1]}, {a: [2,3]}):
 *  - In the default implementation would produce {a:[1,3]}
 *  - With this function would produce: {a: [2,3]}
 * @param {*} objValue
 * @param {*} srcValue
 * @return {*}
 */
// eslint-disable-next-line rulesdir/prefer-early-return
function customizerForMergeWith(objValue, srcValue) {
    // eslint-disable-next-line rulesdir/prefer-underscore-method
    if (Array.isArray(objValue)) {
        return srcValue;
    }
}

function mergeWithCustomized(...args) {
    return lodashMergeWith(...args, customizerForMergeWith);
}

export default mergeWithCustomized;
