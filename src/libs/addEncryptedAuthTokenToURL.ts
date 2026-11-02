import canSendAuthTokenToURL from './canSendAuthTokenToURL';

/**
 * Add encryptedAuthToken to this attachment URL. A URL that is not on an Expensify server comes back unchanged, so the token never leaves Expensify.
 */
export default function addEncryptedAuthTokenToURL(url: string, encryptedAuthToken: string, hasOtherParameters = false) {
    if (!canSendAuthTokenToURL(url)) {
        return url;
    }

    const symbol = hasOtherParameters ? '&' : '?';
    return `${url}${symbol}encryptedAuthToken=${encodeURIComponent(encryptedAuthToken)}`;
}
