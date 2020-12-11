import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import ROUTES from '../../ROUTES';
import Config from '../../CONFIG';

let credentials;
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: val => credentials = val,
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

    // Using doNotRetry:true here because we call CreateLogin after getting a successful response to Authenticate
    // so it's unlikely that we'll get a 407.
    API.CreateLogin({
        partnerName: Config.EXPENSIFY.PARTNER_NAME,
        partnerPassword: Config.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: login,
        partnerUserSecret: password,
        doNotRetry: true,
    })
        .then((response) => {
            creatingLogin = false;

            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }
            if (credentials && credentials.login) {
                // If we have an old login for some reason, we should delete it before storing the new details
                API.DeleteLogin({partnerUserID: credentials.login});
            }
            Onyx.merge(ONYXKEYS.CREDENTIALS, {login, password});

            // Now that we created a login to re-authenticate the user when the authToken expires,
            // we redirect the user and clear the value of redirectTo since we don't need it anymore
            // TODO update
            // Onyx.merge(ONYXKEYS.APP_REDIRECT_TO, redirectTo);
            Onyx.merge(ONYXKEYS.APP_REDIRECT_TO, ROUTES.ROOT);
        });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    createLogin,
};
