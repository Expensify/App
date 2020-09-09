import Ion from './Ion';
import IONKEYS from '../IONKEYS';

const UPDATE_INTERVAL = 1000 * 60 * 60;

// Subscribe to network status, because we only want to attempt updates when we have a network connection.
let isOnline;
Ion.connect({
    key: IONKEYS.NETWORK,
    path: 'isOffline',
    callback: (isCurrentlyOffline) => {
        isOnline = !isCurrentlyOffline;
    }
});

/**
 * Check for updates every hour, and perform and platform-specific update if there is a network connection.
 *
 * @param {Function} platformSpecificUpdate
 * @param {Function} platformSpecificInitializer
 */
export default function (platformSpecificUpdate, platformSpecificInitializer = () => {}) {
    platformSpecificInitializer();

    // Check for updates every hour
    setInterval(() => {
        // We only want to attempt updates if we're online
        if (isOnline) {
            platformSpecificUpdate();
        }
    }, UPDATE_INTERVAL);
}
