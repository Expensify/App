/**
 * Add encryptedAuthToken to this attachment URL
 */
export default function addEncryptedAuthTokenToURL(url: string, encryptedAuthToken: string, hasOtherParameters = false) {
    const symbol = hasOtherParameters ? '&' : '?';
    return `${url}${symbol}encryptedAuthToken=${encodeURIComponent(encryptedAuthToken)}`;
}
