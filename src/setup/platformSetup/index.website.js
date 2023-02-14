import {AppRegistry} from 'react-native';

// This is a polyfill for InternetExplorer to support the modern KeyboardEvent.key and KeyboardEvent.code instead of KeyboardEvent.keyCode
import 'shim-keyboard-event-key';

import Config from '../../CONFIG';
import AppUpdater from '../../libs/AppUpdater';
import checkForUpdates from '../../libs/checkForUpdates';
import DateUtils from '../../libs/DateUtils';

export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    // When app loads, get current version (production only)
    if (Config.IS_IN_PRODUCTION) {
        checkForUpdates(AppUpdater);
    }

    // Start current date updater
    DateUtils.startCurrentDateUpdater();
}
