import _ from 'underscore';
import moment from 'moment';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

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
        },
    });
};

export default init;
