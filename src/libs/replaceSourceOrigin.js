import _ from 'underscore';
import Config from '../CONFIG';

/**
 * Update the URL so images/files can be accessed depending on the config environment
 *
 * @param {String} urlString
 * @returns {String}
 */
export default function replaceSourceOrigin(urlString) {
    // Attachments can come from either staging or prod, depending on the env they were uploaded by
    // Both should be replaced and loaded from API ROOT of the current environment
    const originsToReplace = [Config.EXPENSIFY.EXPENSIFY_URL, Config.EXPENSIFY.STAGING_EXPENSIFY_URL];

    const originToReplace = _.find(originsToReplace, origin => urlString.startsWith(origin));
    if (!originToReplace) {
        return urlString;
    }

    return urlString.replace(
        originToReplace,
        Config.EXPENSIFY.URL_API_ROOT,
    );
}
