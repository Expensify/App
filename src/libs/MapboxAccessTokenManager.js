import _ from 'underscore';
import moment from 'moment';
import Onyx from 'react-native-onyx';
import ONYXKEYS from "../ONYXKEYS";

const init = () => {
    Onyx.connect({
        key: ONYXKEYS.MAPBOX_ACCESS_TOKEN,
        callback: (token) => {
            // token is an object. If it is falsy or an empty object, the token needs to be retrieved from the API.
            if (!token || _.size(token) === 0) {
                // @TODO call the API GetMapboxAccessToken()
                return;
            }
        }
    });
};

export default init;
