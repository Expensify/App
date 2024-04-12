import CONST from '@src/CONST';
import type InternetReachabilityCheck from './types';

/**
 * Although Android supports internet reachability check, it only does on initiating the connection.
 * We need to implement a test for a highly-available endpoint to cover the case internet is lost during connection.
 */
export default function checkInternetReachability(): InternetReachabilityCheck {
    // Using the API url ensures reachability is tested over internet
    return fetch(CONST.GOOGLE_CLOUD_URL, {
        method: 'GET',
        cache: 'no-cache',
    })
        .then((response) => {
            if (!response.ok) {
                return Promise.resolve(false);
            }
            return response
                .json()
                .then((json) => Promise.resolve(json.jsonCode === 204))
                .catch(() => Promise.resolve(false));
        })
        .catch(() => Promise.resolve(false));
}
