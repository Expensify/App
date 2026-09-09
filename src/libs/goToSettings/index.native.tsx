import saveLastRoute from '@libs/saveLastRoute';

import {Linking} from 'react-native';

function goToSettings() {
    Linking.openSettings();
    // In the case of ios, the App reloads when we update contact permission from settings
    // we are saving last route so we can navigate to it after app reload
    saveLastRoute();
}

export default goToSettings;
