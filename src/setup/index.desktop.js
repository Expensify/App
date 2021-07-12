import {AppRegistry} from 'react-native';
import {ipcRenderer} from 'electron';
import Config from '../CONFIG';
import LocalNotification from '../libs/Notification/LocalNotification';
import DateUtils from '../libs/DateUtils';


export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    ipcRenderer.on('update-downloaded', () => {
        LocalNotification.showUpdateAvailableNotification();
    });

    // Start current date updater
    DateUtils.startCurrentDateUpdater();
}
