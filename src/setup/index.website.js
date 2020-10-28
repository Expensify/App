import {AppRegistry} from 'react-native';
import checkForUpdates from '../libs/checkForUpdates';
import Config from '../CONFIG';
import HttpUtils from '../libs/HttpUtils';
import {name as appName} from '../../app.json';
import packageJSON from '../../package.json';
import Visibility from '../libs/Visibility';

/**
 * Download the latest app version from the server, and if it is different than the current one,
 * then refresh. If the page is visibile, prompt the user to refresh.
 *
 * @param {String} currentVersion
 */
function webUpdate(currentVersion) {
    HttpUtils.download('version.json')
        .then(({version: newVersion}) => {
            if (newVersion !== currentVersion) {
                if (!Visibility.isVisible()) {
                    // Page is hidden, refresh immediately
                    window.location.reload(true);
                    return;
                }

                // Prompt user to refresh the page
                if (window.confirm('Refresh the page to get the latest updates!')) {
                    window.location.reload(true);
                }
            }
        });
}

/**
 * Create an object whose shape reflects the callbacks used in checkForUpdates.
 *
 * @param {String} currentVersion The version of the app that is currently running.
 * @returns {Object}
 */
const webUpdater = currentVersion => ({
    init: () => {
        // We want to check for updates and refresh the page if necessary when the app is backgrounded.
        // That way, it will auto-update silently when they minimize the page,
        // and we don't bug the user any more than necessary :)
        window.addEventListener('visibilitychange', () => {
            if (!Visibility.isVisible()) {
                webUpdate(currentVersion);
            }
        });
    },
    update: () => webUpdate(currentVersion),
});

export default function () {
    AppRegistry.runApplication(appName, {
        rootTag: document.getElementById('root'),
    });

    // When app loads, get current version (production only)
    if (Config.IS_IN_PRODUCTION) {
        checkForUpdates(webUpdater(packageJSON.version));
    }
}
