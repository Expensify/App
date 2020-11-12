import HttpUtils from './HttpUtils';

/**
 * Adds our API command to the URL so the API call is more easily identified in the
 * network tab of the JS console
 *
 * @param {string} command
 * @param {string} url
 * @returns {string}
 */
function addCommandToUrl(command, url) {
    let newUrl = url;

    if (command) {
        // Add a ? to the end of the URL if there isn't one already
        if (newUrl.indexOf('?') === -1) {
            newUrl = `${newUrl}?`;
        }
        newUrl = `${newUrl}&command=${command}`;
    }

    return newUrl;
}

/**
 * @param {String} endpoint
 *
 * @returns {Object}
 */
export default function Network(endpoint) {
    if (!endpoint) {
        throw new Error('Cannot instantiate Network without an url endpoint');
    }

    return {
        post(command, parameters, type) {
            HttpUtils.xhr(command, parameters, type);
        },
    };
}
