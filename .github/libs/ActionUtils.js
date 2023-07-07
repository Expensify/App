const core = require('@actions/core');

/**
 * Safely parse a JSON input to a GitHub Action.
 *
 * @param {String} name - The name of the input.
 * @param {Object} options - Options to pass to core.getInput
 * @param {*} [defaultValue] - A default value to provide for the input.
 *                             Not required if the {required: true} option is given in the second arg to this function.
 * @returns {any}
 */
function getJSONInput(name, options, defaultValue = undefined) {
    const input = core.getInput(name, options);
    if (input) {
        return JSON.parse(input);
    }
    return defaultValue;
}

/**
 * Safely access a string input to a GitHub Action, or fall back on a default if the string is empty.
 *
 * @param {String} name
 * @param {Object} options
 * @param {*} [defaultValue]
 * @returns {string|undefined}
 */
function getStringInput(name, options, defaultValue = undefined) {
    const input = core.getInput(name, options);
    if (!input) {
        return defaultValue;
    }
    return input;
}

module.exports = {
    getJSONInput,
    getStringInput,
};
