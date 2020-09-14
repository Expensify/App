/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import checkForUpdates from './src/lib/checkForUpdates';
import {download} from './src/lib/Network';

AppRegistry.registerComponent(appName, () => App);

function webUpdate(currentVersion) {
    download('version.json')
        .then((newVersion) => {
            if (newVersion !== currentVersion) {
                if (window.visibilityState === 'hidden') {
                    // Page is hidden, refresh immediately
                    window.location.reload(true);
                } else if (window.confirm('Refresh the page to get the latest updates!')) {
                    // TODO: Notify user in a less invasive way that they should refresh the page (i.e: Growl)
                    // Prompt user to refresh the page
                    window.location.reload(true);
                }
            }
        });
}

const webUpdater = currentVersion => ({
    init: () => {
        // We want to check for updates and refresh the page if necessary when the app is backgrounded.
        // That way, it will auto-update silently when they minimize the page,
        // and we don't bug the user any more than necessary :)
        window.addEventListener('visibilitychange', () => {
            if (window.visibilityState === 'hidden') {
                webUpdate(currentVersion);
            }
        });
    },
    update: webUpdate(currentVersion),
});

// When app loads, get current version
download('version.json')
    .then((currentVersion) => {
        checkForUpdates(webUpdater(currentVersion));
    });
