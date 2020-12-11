import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../ONYXKEYS';
import {createLogin} from './actions/Credentials';

// When the user authenticates for the first time we create a login and store credentials in Onyx.
// When the user's authToken expires we use this login to re-authenticate and get a new authToken
// and use that new authToken in subsequent API calls
let credentials;

function init() {
    Onyx.connect({
        key: ONYXKEYS.CREDENTIALS,
        callback: ionCredentials => credentials = ionCredentials,
    });

    // Used to prevent calling CreateLogin more than once since this callback is triggered when we set
    // authToken, loading, error, etc
    Onyx.connect({
        key: ONYXKEYS.SESSION,
        callback: (session) => {
            // If we have an authToken but no login, it's the users first time signing in and we need to
            // create a login for the user, so when the authToken expires we can get a new one with said login
            const hasLogin = credentials && credentials.login;
            if (!session || !session.authToken || hasLogin) {
                return;
            }
            createLogin(Str.guid('react-native-chat-'), Str.guid());
        },
    });
}

export default {
    init,
};
