import {Linking} from 'react-native';

// cspell:disable-next-line
const IOS_LOCATION_SETTINGS_URL = 'App-Prefs:Privacy&path=LOCATION';

function openSettings() {
    // Fall back to the app settings page if the location settings URL can't be opened
    Linking.openURL(IOS_LOCATION_SETTINGS_URL).catch(() => Linking.openSettings());
}

export default openSettings;
