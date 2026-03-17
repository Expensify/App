import {Linking} from 'react-native';

const ANDROID_SETTINGS_INTENT = 'android.settings.SETTINGS';

function openSettings() {
    Linking.sendIntent(ANDROID_SETTINGS_INTENT);
}

export default openSettings;
