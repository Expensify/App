import {UrbanAirship} from 'urbanairship-react-native';
import Ion from '../../Ion';
import IONKEYS from '../../../IONKEYS';

/**
 * Get permissions and register this device as a named user in AirshipAPI.
 */
function enablePushNotifications() {
    UrbanAirship.enableUserPushNotifications()
        .finally(() => {
            Ion.connect({
                key: IONKEYS.SESSION,
                callback: (sessionData) => {
                    // This will register this device with the named user associated with this accountID,
                    // or clear the the named user (deregister this device) if sessionData.accountID is undefined
                    UrbanAirship.setNamedUser(sessionData.accountID.toString() || undefined);
                }
            });
        });
}

export default {
    enablePushNotifications,
};
