import {Linking} from 'react-native';

const IOS_SETTINGS_URL = 'App-Prefs:General';

function openSettings() {
    // cspell:disable-next-line
    Linking.openURL(IOS_SETTINGS_URL);
}

export default openSettings;
