import {Linking} from 'react-native';

// cspell:disable-next-line
const IOS_SETTINGS_URL = 'App-Prefs:General';

function openSettings() {
    Linking.openURL(IOS_SETTINGS_URL);
}

export default openSettings;
