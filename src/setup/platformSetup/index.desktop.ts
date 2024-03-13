import {AppRegistry} from 'react-native';
import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';
import DateUtils from '@libs/DateUtils';
import markAllPolicyReportsAsRead from '@libs/markAllPolicyReportsAsRead';
import Navigation from '@libs/Navigation/Navigation';
import LocalNotification from '@libs/Notification/LocalNotification';
import Config from '@src/CONFIG';
import ROUTES from '@src/ROUTES';

// Temporary workaround to give employees the ability to mark reports as read via the JS console
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).markAllPolicyReportsAsRead = markAllPolicyReportsAsRead;

export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
        mode: 'legacy',
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
