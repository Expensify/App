
exports.__esModule = true;
exports.filterObject = exports.shallowCompare = void 0;
const getDefinedKeys = function (obj) {
    return Object.entries(obj)
        .filter(function (_a) {
            const value = _a[1];
            return value !== undefined;
        })
        .map(function (_a) {
            const key = _a[0];
            return key;
        });
};
const shallowCompare = function (obj1, obj2) {
    if (!obj1 && !obj2) {
        return true;
    }
    if (obj1 && obj2) {
        const keys1 = getDefinedKeys(obj1);
        const keys2 = getDefinedKeys(obj2);
        return (
            keys1.length === keys2.length &&
            keys1.every(function (key) {
                return obj1[key] === obj2[key];
            })
        );
    }
    return false;
};
exports.shallowCompare = shallowCompare;
function filterObject(obj, predicate) {
    return Object.keys(obj)
        .filter(function (key) {
            return predicate(key, obj[key]);
        })
        .reduce(function (result, key) {
            // eslint-disable-next-line no-param-reassign
            result[key] = obj[key];
            return result;
        }, {});
}
exports.filterObject = filterObject;
