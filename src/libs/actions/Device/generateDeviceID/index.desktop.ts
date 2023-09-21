import ELECTRON_EVENTS from '../../../../../desktop/ELECTRON_EVENTS';
import {GenerateDeviceID} from "./index";

/**
 * Get the unique ID of the current device. This should remain the same even if the user uninstalls and reinstalls the app.
 *
 * @returns - device ID
 */

const generateDeviceID: GenerateDeviceID = (): Promise<string> => {
    return window.electron.invoke(ELECTRON_EVENTS.REQUEST_DEVICE_ID);
}

export default generateDeviceID;
