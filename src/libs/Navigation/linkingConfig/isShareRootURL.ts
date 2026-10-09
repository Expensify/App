import ROUTES from '@src/ROUTES';

import prefixes from './prefixes';

/**
 * Whether the URL opens the share flow. Android launches `new-expensify://share/root` after a file is shared to the app.
 */
function isShareRootURL(url: string): boolean {
    const prefix = prefixes.find((linkPrefix) => url.startsWith(linkPrefix));
    if (!prefix) {
        return false;
    }

    const path = url.slice(prefix.length).split(/[?#]/).at(0) ?? '';
    return path.replaceAll(/^\/+|\/+$/g, '') === ROUTES.SHARE_ROOT;
}

export default isShareRootURL;
