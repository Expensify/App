import {AppRegistry} from 'react-native';
import {ipcRenderer} from 'electron';
import Config from '../../CONFIG';
import LocalNotification from '../../libs/Notification/LocalNotification';
import * as KeyboardShortcuts from '../../libs/actions/KeyboardShortcuts';
import DateUtils from '../../libs/DateUtils';


export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    ipcRenderer.on('update-downloaded', () => {
        LocalNotification.showUpdateAvailableNotification();
    });

    // Trigger action to show keyboard shortcuts
    ipcRenderer.on('show-keyboard-shortcuts-modal', KeyboardShortcuts.showKeyboardShortcutModal);

    // Start current date updater
    DateUtils.startCurrentDateUpdater();
}
