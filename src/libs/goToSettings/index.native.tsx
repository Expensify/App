import {Linking} from 'react-native';
import saveLastRoute from '@libs/saveLastRoute';

function goToSettings() {
    Linking.openSettings();
    // In the case of ios, the App reloads when we update contact permission from settings
    // we are saving last route so we can navigate to it after app reload
    saveLastRoute();
}

export default goToSettings;
