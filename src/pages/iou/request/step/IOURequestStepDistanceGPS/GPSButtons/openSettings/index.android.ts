import {Linking} from 'react-native';

const ANDROID_LOCATION_SETTINGS_INTENT = 'android.settings.LOCATION_SOURCE_SETTINGS';

function openSettings() {
    // Fall back to the app settings page if the device can't handle the location settings intent
    Linking.sendIntent(ANDROID_LOCATION_SETTINGS_INTENT).catch(() => Linking.openSettings());
}

export default openSettings;
