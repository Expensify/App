import {AppRegistry} from 'react-native';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import LocalNotification from '@libs/Notification/LocalNotification';
import Config from '@src/CONFIG';
import ROUTES from '@src/ROUTES';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';

function beforeAppLoad() {
    return Promise.resolve();
}

function afterAppLoad() {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    return Promise.resolve();
}

function additional() {
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

    return Promise.resolve();
}

export {beforeAppLoad, afterAppLoad, additional};
