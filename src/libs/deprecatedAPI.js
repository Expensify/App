import requireParameters from './requireParameters';
import * as Network from './Network';

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
    // eslint-disable-next-line import/prefer-default-export
    User_SecondaryLogin_Send,
};
