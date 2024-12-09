import {AppRegistry} from 'react-native';
import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import LocalNotification from '@libs/Notification/LocalNotification';
import Config from '@src/CONFIG';
import ROUTES from '@src/ROUTES';

export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    // Send local notification when update is downloaded
    window.electron.on(ELECTRON_EVENTS.UPDATE_DOWNLOADED, () => {
        LocalNotification.showUpdateAvailableNotification();
    });

    // Trigger action to show keyboard shortcuts
    window.electron.on(ELECTRON_EVENTS.KEYBOARD_SHORTCUTS_PAGE, () => {
        Navigation.navigate(ROUTES.KEYBOARD_SHORTCUTS);
    });

    // Start current date updater
    DateUtils.startCurrentDateUpdater();
}
