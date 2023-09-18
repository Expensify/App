import ELECTRON_EVENTS from '../../../../../desktop/ELECTRON_EVENTS';

/**
 * Get the unique ID of the current device. This should remain the same even if the user uninstalls and reinstalls the app.
 *
 * @returns - device ID
 */

function generateDeviceID(): Promise<string> {
    return window.electron.invoke(ELECTRON_EVENTS.REQUEST_DEVICE_ID);
}

export default generateDeviceID;
