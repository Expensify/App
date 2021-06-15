/**
 * Add authToken to this attachment URL if necessary
 *
 * @param {Object} parameters
 * @param {String} parameters.url
 * @param {Boolean} parameters.required
 * @param {String} parameters.encryptedAuthToken
 * @returns {String}
 */
export default function ({url, encryptedAuthToken, required = true}) {
    return required
        ? `${url}?encryptedAuthToken=${encryptedAuthToken}`
        : url;
}
