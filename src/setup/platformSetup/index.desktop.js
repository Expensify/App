import {AppRegistry} from 'react-native';
import Config from '../../CONFIG';
import LocalNotification from '../../libs/Notification/LocalNotification';
import * as KeyboardShortcuts from '../../libs/actions/KeyboardShortcuts';
import DateUtils from '../../libs/DateUtils';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';


export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    // Send local notification when update is downloaded
    window.electronContextBridge.on(ELECTRON_EVENTS.UPDATE_DOWNLOADED, () => {
        LocalNotification.showUpdateAvailableNotification();
    });

    // Trigger action to show keyboard shortcuts
    window.electronContextBridge.on(ELECTRON_EVENTS.SHOW_KEYBOARD_SHORTCUTS_MODAL, KeyboardShortcuts.showKeyboardShortcutModal);

    // Start current date updater
    DateUtils.startCurrentDateUpdater();
}
