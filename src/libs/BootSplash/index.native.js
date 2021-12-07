import RNBootSplash from 'react-native-bootsplash';
import Log from '../Log';

// react-native-bootsplash 3.x could reject if not init (ex: when opening app via iOS >= 15 notifications)
// As the splash screen is not visible on these cases, we chose to ignore these errors.
function hide(config) {
    Log.info('[BootSplash] hiding splash screen', false);

    return RNBootSplash
        .hide(config)
        .catch((error) => {
            Log.alert('[BootSplash] hiding failed', {message: error.message, error}, false);
        });
}

export default {
    hide,
    getVisibilityStatus: RNBootSplash.getVisibilityStatus,
};
