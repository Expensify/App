import {AppRegistry} from 'react-native';
import {ipcRenderer} from 'electron';
import Onyx from 'react-native-onyx';
import Config from '../CONFIG';
import LocalNotification from '../libs/Notification/LocalNotification';
import ONYXKEYS from '../ONYXKEYS';


export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    ipcRenderer.on('update-downloaded', (_, version) => {
        LocalNotification.showUpdateAvailableNotification();
        Onyx.merge(ONYXKEYS.UPDATE_VERSION, version);
    });
}
