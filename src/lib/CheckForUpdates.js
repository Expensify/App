import {AppState, Platform} from 'react-native';
import {download, isOnline} from './Network';

const UPDATE_INTERVAL = 1000 * 60 * 60;

export default function (platformSpecificUpdate) {
    // When app first loads, get current version
    let currentVersion = download('version.txt');

    const updateIfNecessary = () => {
        // We only want to attempt updates if we're online
        if (isOnline()) {
            download('version.txt')
                .then(response => response.json())
                .then((newVersion) => {
                    const needsUpdate = newVersion !== currentVersion;
                    if (needsUpdate && platformSpecificUpdate()) {
                        currentVersion = newVersion;
                    }
                });
        }
    };

    // Check for updates every hour
    setInterval(updateIfNecessary, UPDATE_INTERVAL);

    // On Web, we want to refresh the page if necessary when the app is backgrounded.
    // That way, it will auto-update silently when they minimize the page,
    // and we don't bug the user any more than necessary :)
    if (Platform.OS === 'web') {
        AppState.addEventListener('change', () => {
            if (AppState.currentState === 'background') {
                updateIfNecessary();
            }
        });
    }
}
