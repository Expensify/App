import _ from 'underscore';

/**
 * @throws {Error} If the "parameters" object has a null or undefined value for any of the given parameterNames
 *
 * @param {String[]} parameterNames Array of the required parameter names
 * @param {Object} parameters A map from available parameter names to their values
 * @param {String} commandName The name of the API command
 */
export default function requireParameters(parameterNames, parameters, commandName) {
    parameterNames.forEach((parameterName) => {
        if (_(parameters).has(parameterName) && parameters[parameterName] !== null && parameters[parameterName] !== undefined) {
            return;
        }

        const propertiesToRedact = ['authToken', 'password', 'partnerUserSecret', 'twoFactorAuthCode'];
        const parametersCopy = _.chain(parameters)
            .clone()
            .mapObject((val, key) => (_.contains(propertiesToRedact, key) ? '<redacted>' : val))
            .value();
        const keys = _(parametersCopy).keys().join(', ') || 'none';

        let error = `Parameter ${parameterName} is required for "${commandName}". `;
        error += `Supplied parameters: ${keys}`;
        throw new Error(error);
    });
}
