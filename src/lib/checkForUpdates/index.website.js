import Ion from '../Ion';
import IONKEYS from '../../IONKEYS';

const UPDATE_INTERVAL = 1000 * 60 * 60;

// Subscribe to network status, because we only want to attempt updates when we have a network connection.
let isOnline;
Ion.connect({
    key: IONKEYS.NETWORK,
    callback: network => isOnline = network && !network.isOffline,
});

/**
 * Check for updates every hour, and perform and platform-specific update if there is a network connection.
 *
 * @param {Object} platformSpecificUpdater
 * @param {Function} platformSpecificUpdater.update
 * @param {?Function} platformSpecificUpdater.init
 */
export default function (platformSpecificUpdater) {
    if (platformSpecificUpdater.init) {
        platformSpecificUpdater.init();
    }

    // Check for updates every hour
    setInterval(() => {
        // We only want to attempt updates if we're online
        if (isOnline) {
            platformSpecificUpdater.update();
        }
    }, UPDATE_INTERVAL);
}
