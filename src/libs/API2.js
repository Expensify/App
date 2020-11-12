import _ from 'underscore';

export default function API(network, args) {
    if (!network) {
        throw new Error('Cannot instantiate API without a Network object');
    }

    /**
     * @private
     *
     * Maps jsonCode => array of callback functions
     */
    const defaultHandlers = {};

    /**
     * Triggers the callback for an specific jsonCodes
     *
     * @param {String} networkPromise
     */
    function attachJSONCodeCallbacks(networkPromise) {
        networkPromise.then((response) => {
            let defaultHandlerWasUsed = false;
            _.each(defaultHandlers[response.jsonCode], (callback) => {
                defaultHandlerWasUsed = true;
                callback(response);
            });

            if (defaultHandlerWasUsed) {
                // Prevent other handlers from being triggered on this promise
                throw new Error('A default handler was used for this request');
            }
            return response;
        });
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
                // eslint-disable-next-line max-len
                throw new Error(`Parameter ${parameterName} is required for "${commandName}". Supplied parameters: ${keys}`);
            }
        });
    }

    /**
     * @private
     *
     * @param {String} command Name of the command to run
     * @param {Object} [parameters] A map of parameter names to their values
     * @param {string} [type]
     *
     * @returns {APIDeferred} An APIDeferred representing the promise of this request
     */
    function performPOSTRequest(command, parameters, type = 'post') {
        // If there was an enhanceParameters() method supplied in our args, then we will call that here
        const finalParameters = (args && _.isFunction(args.enhanceParameters))
            ? args.enhanceParameters(parameters)
            : parameters;

        const networkPromise = network.post(command, finalParameters, type);

        // Attach any JSONCode callbacks to our promise
        attachJSONCodeCallbacks(networkPromise);
    }

    return {
        /**
         * Register a callback function to be called when specific json codes are returned
         *
         * @param  {Number[]} jsonCodes
         * @param  {Function} callback
         */
        registerDefaultHandler(jsonCodes, callback) {
            if (!_(callback).isFunction()) {
                return;
            }

            jsonCodes.forEach((jsonCode) => {
                if (!defaultHandlers[jsonCode]) {
                    defaultHandlers[jsonCode] = [];
                }
                defaultHandlers[jsonCode].push(callback);
            });
        },

        /**
         * @param {object} parameters
         * @param {string} parameters.partnerUserID
         * @param {string} parameters.partnerName
         * @param {string} parameters.partnerPassword
         * @param {string} parameters.doNotRetry
         * @returns {Promise}
         */
        deleteLogin(parameters) {
            const commandName = 'DeleteLogin';
            requireParameters(['partnerUserID', 'partnerName', 'partnerPassword', 'doNotRetry'],
                parameters, commandName);
            return performPOSTRequest(commandName, parameters);
        },

        /**
         * @param {object} parameters
         * @param {string} parameters.returnValueList
         * @returns {Promise}
         */
        get(parameters) {
            const commandName = 'Get';
            requireParameters(['returnValueList'],
                parameters, commandName);
            return performPOSTRequest(commandName, parameters);
        },

        /**
         * @param {object} parameters
         * @param {string} parameters.emailList
         * @returns {Promise}
         */
        getPersonalDetails(parameters) {
            const commandName = 'PersonalDetails_GetForEmails';
            requireParameters(['emailList'],
                parameters, commandName);
            return performPOSTRequest(commandName, parameters);
        },

        /**
         * @param {Object} parameters
         * @param {String} parameters.message
         * @param {Object} parameters.parameters
         * @param {String} parameters.expensifyCashAppVersion
         * @param {String} [parameters.email]
         * @returns {Promise}
         */
        logToServer(parameters) {
            const commandName = 'Log';
            requireParameters(['message', 'parameters', 'expensifyCashAppVersion'],
                parameters, commandName);
            return performPOSTRequest(commandName, parameters);
        },

        Report: {
            /**
             * @param {object} parameters
             * @param {string} parameters.reportComment
             * @param {number} parameters.reportID
             * @param {object} [parameters.file]
             * @returns {Promise}
             */
            addComment(parameters) {
                const commandName = 'Report_AddComment';
                requireParameters(['reportComment', 'reportID'],
                    parameters, commandName);
                return performPOSTRequest(commandName, parameters);
            },

            /**
             * @param {object} parameters
             * @param {string} parameters.emailList
             * @returns {Promise}
             */
            createChat(parameters) {
                const commandName = 'CreateChatReport';
                requireParameters(['emailList'],
                    parameters, commandName);
                return performPOSTRequest(commandName, parameters);
            },

            /**
             * @param {object} parameters
             * @param {number} parameters.reportID
             * @returns {Promise}
             */
            getHistory(parameters) {
                const commandName = 'Report_GetHistory';
                requireParameters(['reportID'],
                    parameters, commandName);
                return performPOSTRequest(commandName, parameters);
            },

            /**
             * @param {object} parameters
             * @param {number} parameters.reportID
             * @param {boolean} parameters.pinnedValue
             * @returns {Promise}
             */
            togglePinnedReport(parameters) {
                const commandName = 'Report_TogglePinned';
                requireParameters(['reportID', 'pinnedValue'],
                    parameters, commandName);
                return performPOSTRequest(commandName, parameters);
            },

            /**
             * @param {object} parameters
             * @param {number} parameters.accountID
             * @param {number} parameters.reportID
             * @param {number} parameters.sequenceNumber
             * @returns {Promise}
             */
            setLastReadActionID(parameters) {
                const commandName = 'Report_SetLastReadActionID';
                requireParameters(['accountID', 'reportID', 'sequenceNumber'],
                    parameters, commandName);
                return performPOSTRequest(commandName, parameters);
            }
        },

        JSON_CODES: {
            AUTH_FAILURES: [
                407, // AuthToken Invalid/Expired
            ],
        },
    };
}
