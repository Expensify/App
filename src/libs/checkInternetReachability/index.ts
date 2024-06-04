import type InternetReachabilityCheck from './types';

export default function checkInternetReachability(): InternetReachabilityCheck {
    return Promise.resolve(true);
}
