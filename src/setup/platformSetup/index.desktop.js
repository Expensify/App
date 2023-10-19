import {AppRegistry} from 'react-native';
import Config from '../../CONFIG';
import LocalNotification from '../../libs/Notification/LocalNotification';
import DateUtils from '../../libs/DateUtils';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

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
