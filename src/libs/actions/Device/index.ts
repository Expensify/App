import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import generateDeviceID from './generateDeviceID';
import getDeviceInfo from './getDeviceInfo';

let deviceID: string | null = null;

/**
 * @returns - device ID string or null in case of failure
 */
function getDeviceID(): Promise<string | null> {
    return new Promise((resolve) => {
        if (deviceID) {
            return resolve(deviceID);
        }

        const connectionID = Onyx.connect({
            key: ONYXKEYS.DEVICE_ID,
            callback: (id) => {
                Onyx.disconnect(connectionID);
                deviceID = id;
                return resolve(id);
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
        .then((uniqueID: string) => {
            Log.info('Got new deviceID', false, uniqueID);
            Onyx.set(ONYXKEYS.DEVICE_ID, uniqueID);
        })
        .catch((err) => Log.info('Found existing deviceID', false, err.message));
}

/**
 * Returns a string object with device info and uniqueID
 * @returns - device info with ID
 */
function getDeviceInfoWithID(): Promise<string> {
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
