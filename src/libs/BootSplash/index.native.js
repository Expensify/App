import RNBootSplash from 'react-native-bootsplash';
import Log from '../Log';

export default {
    // react-native-bootsplash 3.x could reject if not init (ex: when opening app via iOS >= 15 notifications)
    // As the splash screen is not visible on these cases, we chose to ignore these errors.
    hide: config => RNBootSplash.hide(config).catch((error) => {
        Log.alert('[BootSplash] hiding failed', {message: error.message, error}, false);
    }),
    show: config => RNBootSplash.show(config).catch((error) => {
        Log.alert('[BootSplash] showing failed', {message: error.message, error}, false);
    }),

    getVisibilityStatus: RNBootSplash.getVisibilityStatus,
};
