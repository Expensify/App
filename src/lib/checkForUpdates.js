import {AppState, Platform} from 'react-native';
import {isOnline} from './Network';

const UPDATE_INTERVAL = 1000 * 60 * 60;

export default function (platformSpecificUpdate) {
    const updateIfOnline = () => {
        // We only want to attempt updates if we're online
        if (isOnline()) {
            platformSpecificUpdate();
        }
    };

    // Check for updates every hour
    setInterval(updateIfOnline, UPDATE_INTERVAL);

    // On Web, we want to check for updates and refresh the page if necessary when the app is backgrounded.
    // That way, it will auto-update silently when they minimize the page,
    // and we don't bug the user any more than necessary :)
    if (Platform.OS === 'web') {
        AppState.addEventListener('change', () => {
            if (AppState.currentState === 'background') {
                updateIfOnline();
            }
        });
    }
}
