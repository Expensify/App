import {AppRegistry} from 'react-native';
import checkForUpdates from '@libs/checkForUpdates';
import DateUtils from '@libs/DateUtils';
import Visibility from '@libs/Visibility';
import Config from '@src/CONFIG';
import pkg from '../../../package.json';
import type PlatformSpecificUpdater from './types';

/**
 * Download the latest app version from the server, and if it is different than the current one,
 * then refresh. If the page is visibile, prompt the user to refresh.
 */
function webUpdate() {
    fetch('/version.json', {cache: 'no-cache'})
        .then((response) => response.json())
        .then(({version}) => {
            if (version === pkg.version) {
                return;
            }

            if (!Visibility.isVisible()) {
                // Page is hidden, refresh immediately
                window.location.reload();
                return;
            }

            // Prompt user to refresh the page
            if (window.confirm('Refresh the page to get the latest updates!')) {
                window.location.reload();
            }
        });
}

/**
 * Create an object whose shape reflects the callbacks used in checkForUpdates.
 */
const webUpdater = (): PlatformSpecificUpdater => ({
    init: () => {
        // We want to check for updates and refresh the page if necessary when the app is backgrounded.
        // That way, it will auto-update silently when they minimize the page,
        // and we don't bug the user any more than necessary :)
        window.addEventListener('visibilitychange', () => {
            if (Visibility.isVisible()) {
                return;
            }

            webUpdate();
        });
    },
    update: () => webUpdate(),
});

export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    // When app loads, get current version (production only)
    if (Config.IS_IN_PRODUCTION) {
        checkForUpdates(webUpdater());
    }

    // Start current date updater
    DateUtils.startCurrentDateUpdater();
}
