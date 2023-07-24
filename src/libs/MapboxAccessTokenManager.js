import _ from 'underscore';
import moment from 'moment';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

let refreshIntervalID;
const refreshToken = () => {
    // Cancel any previous timeouts so that there is only one request to get a token at a time
    if (refreshIntervalID) {
        clearTimeout(refreshIntervalID);
    }
    // @TODO call the API GetMapboxAccessToken()
};

const init = () => {
    Onyx.connect({
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
        callback: (token) => {
            // token is an object. If it is falsy or an empty object, the token needs to be retrieved from the API.
            if (!token || _.size(token) === 0) {
                // @TODO call the API GetMapboxAccessToken()
                return;
            }

            const now = moment();
            const expiration = moment(token.expiration);
            const minutesUntilTokenExpires = now.diff(expiration, 'minutes');
            const tokenHasExpired = minutesUntilTokenExpires < 0;
            if (tokenHasExpired) {
                // Use set() to delete the key from Onyx, which will trigger the flow above
                Onyx.set(ONYXKEYS.MAPBOX_ACCESS_TOKEN, null);
                return;
            }

            // Refresh the token every 25 minutes
            refreshIntervalID = setTimeout(refreshToken, 1000 * 60 * 25);
        },
    });
};

export default init;
