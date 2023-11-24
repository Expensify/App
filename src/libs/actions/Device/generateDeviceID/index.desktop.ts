import ELECTRON_EVENTS from '../../../../../desktop/ELECTRON_EVENTS';
import GenerateDeviceID from './types';

/**
 * Get the unique ID of the current device. This should remain the same even if the user uninstalls and reinstalls the app.
 */

const generateDeviceID: GenerateDeviceID = () => window.electron.invoke(ELECTRON_EVENTS.REQUEST_DEVICE_ID) as Promise<string>;

export default generateDeviceID;
