import {isOnline} from './Network';

const UPDATE_INTERVAL = 1000 * 60 * 60;

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
        if (isOnline()) {
            platformSpecificUpdate();
        }
    }, UPDATE_INTERVAL);
}
