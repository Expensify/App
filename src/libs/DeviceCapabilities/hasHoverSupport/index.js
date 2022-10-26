/**
 * Allows us to identify whether the platform is hoverable.
 *
 * @returns {Boolean}
 */

import * as Browser from '../../Browser';

function hasHoverSupport() {
    // First check internet explorer, because it doesn't support interaction media queries:
    // https://caniuse.com/?search=media%20features
    if (Browser.isInternetExplorer()) {
        return !Browser.isMobile();
    }
    return !window.matchMedia('(hover: none)').matches;
}

export default hasHoverSupport;
