import _ from 'underscore';

export default function API(network, args) {
    /**
     * @private
     *
     * Maps jsonCode => array of callback functions
     */
    const defaultHandlers = {};

    if (!network) {
        throw new Error('Cannot instantiate API without a Network object');
    }

    /**
     * @private
     *
     * @param {String} command Name of the command to run
     * @param {Object} [parameters] A map of parameter names to their values
     * @param {String} [returnedPropertyName] The value of the property that you want to return if you don't want to
     *                      return the whole response JSON
     * @param {Boolean} [keepalive] Whether or not the request should be kept alive if the browser is closed in the
     *                      middle of the request
     * @param {Boolean} [checkCodeRevision] Whether or not the code revision should be validated
     *
     * @returns {APIDeferred} An APIDeferred representing the promise of this request
     */
    function performPOSTRequest(command, parameters) {
        let newParameters = {...parameters, command};

        // If there was an enhanceParameters() method supplied in our args, then we will call that here
        if (args && _.isFunction(args.enhanceParameters)) {
            newParameters = args.enhanceParameters(newParameters);
        }

        return network.post(newParameters);
    }

    /**
     * @throws {Error} If the "parameters" object has a null or undefined value for any of the given parameterNames
     *
     * @private
     *
     * @param {String[]} parameterNames Array of the required parameter names
     * @param {Object} parameters A map from available parameter names to their values
     * @param {String} commandName The name of the API command
     */
    function requireParameters(parameterNames, parameters, commandName) {
        parameterNames.forEach((parameterName) => {
            if (!_(parameters).has(parameterName)
                || parameters[parameterName] === null
                || parameters[parameterName] === undefined
            ) {
                const parametersCopy = _.clone(parameters);
                if (_(parametersCopy).has('authToken')) {
                    parametersCopy.authToken = '<redacted>';
                }
                if (_(parametersCopy).has('password')) {
                    parametersCopy.password = '<redacted>';
                }
                const keys = _(parametersCopy).keys().join(', ') || 'none';
                throw new Error(`Parameter ${parameterName} is required for "${commandName}". Supplied parameters: ${keys}`);
            }
        });
    }

    return {

    };
}
