"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = requireParameters;
/**
 * @throws {Error} If the "parameters" object has a null or undefined value for any of the given parameterNames
 *
 * @param parameterNames Array of the required parameter names
 * @param parameters A map from available parameter names to their values
 * @param commandName The name of the API command
 */
function requireParameters(parameterNames, parameters, commandName) {
    parameterNames.forEach(function (parameterName) {
        if (parameterName in parameters && parameters[parameterName] !== null && parameters[parameterName] !== undefined) {
            return;
        }
        var propertiesToRedact = ['authToken', 'password', 'partnerUserSecret', 'twoFactorAuthCode'];
        var parametersCopy = __assign({}, parameters);
        Object.keys(parametersCopy).forEach(function (key) {
            if (!propertiesToRedact.includes(key.toString())) {
                return;
            }
            parametersCopy[key] = '<redacted>';
        });
        var keys = Object.keys(parametersCopy).join(', ') || 'none';
        var error = "Parameter ".concat(parameterName, " is required for \"").concat(commandName, "\". ");
        error += "Supplied parameters: ".concat(keys);
        throw new Error(error);
    });
}
