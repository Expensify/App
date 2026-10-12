import CONST from '@src/CONST';

/**
 * Exact pathname match only. The apple-app-site-association file claiming this path is served by the production
 * and staging NewDot hosts, so a substring match would also swallow unrelated deep links.
 */
function isNativeOAuthCallbackURL(url: string): boolean {
    try {
        return new URL(url).pathname === CONST.CLOUDFLARE_ACCESS.NATIVE_OAUTH_CALLBACK_PATH;
    } catch {
        return false;
    }
}

export default isNativeOAuthCallbackURL;
