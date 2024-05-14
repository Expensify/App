import CONST from '@src/CONST';
import type InternetReachabilityCheck from './types';

/**
 * Although Android supports internet reachability check, it only does on initiating the connection.
 * We need to implement a test for a highly-available endpoint in case of lost internet after initiation.
 */
export default function checkInternetReachability(): InternetReachabilityCheck {
    return fetch(CONST.GOOGLE_CLOUD_URL, {
        method: 'GET',
        cache: 'no-cache',
    })
        .then((response) => Promise.resolve(response.status === 204))
        .catch(() => Promise.resolve(false));
}
