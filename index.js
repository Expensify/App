/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import checkForUpdates from './src/lib/checkForUpdates';
import {download} from './src/lib/Network';

AppRegistry.registerComponent(appName, () => App);

// When app loads, get current version
download('version.json')
    .then((currentVersion) => {
        checkForUpdates(() => {
            download('version.json')
                .then((newVersion) => {
                    if (newVersion !== currentVersion) {
                        if (window.visibilityState === 'hidden') {
                            // Page is hidden, refresh immediately
                            window.location.reload(true);
                        } else {
                            // TODO: Notify user in a less invasive way that they should refresh the page (i.e: Growl)
                            // Prompt user to refresh the page
                            if (window.confirm('Refresh the page to get the latest updates!')) {
                                window.location.reload(true);
                            }
                        }
                    }
                });
        });
    });
