/**
 * Add authToken to this attachment URL if necessary
 *
 * @param {Object} parameters
 * @param {String} parameters.url
 * @param {Boolean} parameters.required
 * @param {String} parameters.authToken
 * @returns {String}
 */
export default function ({url, authToken, required = true}) {
    return required
        ? `${url}?authToken=${authToken}`
        : url;
}
