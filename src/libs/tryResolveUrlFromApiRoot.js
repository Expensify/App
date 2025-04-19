
exports.__esModule = true;
const CONFIG_1 = require('@src/CONFIG');
const ApiUtils = require('./ApiUtils');
// Absolute URLs (`/` or `//`) should be resolved from API ROOT
// Legacy attachments can come from either staging or prod, depending on the env they were uploaded by
// Both should be replaced and loaded from API ROOT of the current environment
const ORIGINS_TO_REPLACE = ['/+', CONFIG_1['default'].EXPENSIFY.EXPENSIFY_URL, CONFIG_1['default'].EXPENSIFY.STAGING_API_ROOT, CONFIG_1['default'].EXPENSIFY.DEFAULT_API_ROOT];
// Anything starting with a match from ORIGINS_TO_REPLACE
const ORIGIN_PATTERN = new RegExp(`^(${  ORIGINS_TO_REPLACE.join('|')  })`);
function tryResolveUrlFromApiRoot(url) {
    // in native, when we import an image asset, it will have a number representation which can be used in `source` of Image
    // in this case we can skip the url resolving
    if (typeof url !== 'string') {
        return url;
    }
    const apiRoot = ApiUtils.getApiRoot({shouldUseSecure: false});
    return url.replace(ORIGIN_PATTERN, apiRoot);
}
exports['default'] = tryResolveUrlFromApiRoot;
