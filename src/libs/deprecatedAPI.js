import requireParameters from './requireParameters';
import * as Request from './Request';
import * as Network from './Network';
import * as Middleware from './Middleware';
import CONST from '../CONST';

// Setup API middlewares. Each request made will pass through a series of middleware functions that will get called in sequence (each one passing the result of the previous to the next).
// Note: The ordering here is intentional as we want to Log, Recheck Connection, Reauthenticate, and Save the Response in Onyx. Errors thrown in one middleware will bubble to the next
// e.g. an error thrown in Logging or Reauthenticate logic will be caught by the next middleware or the SequentialQueue which retries failing requests.

// Logging - Logs request details and errors.
Request.use(Middleware.Logging);

// RecheckConnection - Sets a  timer for a request that will "recheck" if we are connected to the internet if time runs out. Also triggers the connection recheck when we encounter any error.
Request.use(Middleware.RecheckConnection);

// Reauthentication - Handles jsonCode 407 which indicates an expired authToken. We need to reauthenticate and get a new authToken with our stored credentials.
Request.use(Middleware.Reauthentication);

// SaveResponseInOnyx - Merges either the successData or failureData into Onyx depending on if the call was successful or not
Request.use(Middleware.SaveResponseInOnyx);

/**
 * @param {Object} parameters
 * @param {String} parameters.returnValueList
 * @param {Boolean} shouldUseSecure
 * @returns {Promise}
 */
function Get(parameters, shouldUseSecure = false) {
    const commandName = 'Get';
    requireParameters(['returnValueList'], parameters, commandName);
    return Network.post(commandName, parameters, CONST.NETWORK.METHOD.POST, shouldUseSecure);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.name
 * @param {String} parameters.value
 * @returns {Promise}
 */
function SetNameValuePair(parameters) {
    const commandName = 'SetNameValuePair';
    requireParameters(['name', 'value'], parameters, commandName);
    return Network.post(commandName, parameters);
}

/**
 * @param {Object} parameters
 * @param {String} parameters.email
 * @param {String} parameters.password
 * @returns {Promise}
 */
function User_SecondaryLogin_Send(parameters) {
    const commandName = 'User_SecondaryLogin_Send';
    requireParameters(['email', 'password'], parameters, commandName);
    return Network.post(commandName, parameters);
}

export {
    Get,
    SetNameValuePair,
    User_SecondaryLogin_Send,
};
