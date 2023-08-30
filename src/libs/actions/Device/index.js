import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import Log from '../../Log';
import generateDeviceID from './generateDeviceID';
import getDeviceInfo from './getDeviceInfo';

let deviceID;

/**
 * @returns {Promise<String>}
 */
function getDeviceID() {
    return new Promise((resolve) => {
        if (deviceID) {
            return resolve(deviceID);
        }

        const connectionID = Onyx.connect({
            key: ONYXKEYS.DEVICE_ID,
            callback: (ID) => {
                Onyx.disconnect(connectionID);
                deviceID = ID;
                return resolve(ID);
            },
        });
    });
}

/**
 * Saves a unique deviceID into Onyx.
 */
function setDeviceID() {
    getDeviceID()
        .then((existingDeviceID) => {
            if (!existingDeviceID) {
                return Promise.resolve();
            }
            throw new Error(existingDeviceID);
        })
        .then(generateDeviceID)
        .then((uniqueID) => {
            Log.info('Got new deviceID', false, uniqueID);
            Onyx.set(ONYXKEYS.DEVICE_ID, uniqueID);
        })
        .catch((err) => Log.info('Found existing deviceID', false, err.message));
}

/**
 * Returns a string object with device info and uniqueID
 * @returns {Promise<string>}
 */
function getDeviceInfoWithID() {
    return new Promise((resolve) => {
        getDeviceID().then((currentDeviceID) =>
            resolve(
                JSON.stringify({
                    ...getDeviceInfo(),
                    deviceID: currentDeviceID,
                }),
            ),
        );
    });
}
export {getDeviceID, setDeviceID, getDeviceInfoWithID};
