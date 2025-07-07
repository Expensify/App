"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJSONInput = getJSONInput;
exports.getStringInput = getStringInput;
var core = require("@actions/core");
/**
 * Safely parse a JSON input to a GitHub Action.
 *
 * @param name - The name of the input.
 * @param options - Options to pass to core.getInput
 * @param [defaultValue] - A default value to provide for the input.
 *                         Not required if the {required: true} option is given in the second arg to this function.
 */
function getJSONInput(name, options, defaultValue) {
    var input = core.getInput(name, options);
    if (input) {
        return JSON.parse(input);
    }
    return defaultValue;
}
/**
 * Safely access a string input to a GitHub Action, or fall back on a default if the string is empty.
 */
function getStringInput(name, options, defaultValue) {
    var input = core.getInput(name, options);
    if (!input) {
        return defaultValue;
    }
    return input;
}
