import _ from 'underscore';

/**
 * Converts an array of strings to a spoken list, like:
 *
 * ['rory', 'vit', 'jules'] => 'rory, vit, and jules'
 *
 * @param {Array} arr
 * @returns {String}
 */
function arrayToSpokenList(arr) {
    if (_.isEmpty(arr)) {
        return '';
    }

    if (arr.length === 1) {
        return arr[0];
    }

    if (arr.length === 2) {
        return `${arr[0]} and ${arr[1]}`;
    }

    let result = arr[0];
    for (let i = 1; i < arr.length - 1; i++) {
        result += `, ${arr[i]}`;
    }
    return `${result}, and ${arr[arr.length - 1]}`;
}

export default {
    arrayToSpokenList,
};
