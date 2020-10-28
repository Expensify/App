import * as API from '../API';
import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';
import ROUTES from '../../ROUTES';
import Str from '../Str';
import Guid from '../Guid';

let credentials;
Ion.connect({
    key: IONKEYS.CREDENTIALS,
    callback: ionCredentials => credentials = ionCredentials,
});

// We should only ever be creating a single login at a time
let creatingLogin = false;

/**
 * @param {string} login
 * @param {string} password
 */
function createLogin(login, password) {
    if (creatingLogin) {
        return;
    }

    creatingLogin = true;

    // Using xhr instead of request because request has logic to retry API commands when we get a 407 authToken expired
    // in the response, and we call CreateLogin after getting a successful response to Authenticate so it's unlikely
    // that we'll get a 407.
    API.createLogin(Str.generateDeviceLoginID(), Guid())
        .then((response) => {
            creatingLogin = false;

            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }
            if (credentials && credentials.login) {
                // If we have an old login for some reason, we should delete it before storing the new details
                API.deleteLogin({partnerUserID: credentials.login});
            }
            Ion.merge(IONKEYS.CREDENTIALS, {login, password});

            // Now that we created a login to re-authenticate the user when the authToken expires,
            // we redirect the user and clear the value of redirectTo since we don't need it anymore
            // TODO update
            // Ion.merge(IONKEYS.APP_REDIRECT_TO, redirectTo);
            Ion.merge(IONKEYS.APP_REDIRECT_TO, ROUTES.ROOT);
        });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    createLogin,
};
