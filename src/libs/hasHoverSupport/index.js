/**
 * Allows us to identify whether the platform is hoverable.
 *
 * @returns {Boolean}
 */

import * as Browser from '../Browser';

function hasHoverSupport() {
    if (Browser.isInternetExplorer()) {
        return true;
    }
    return !window.matchMedia('(hover: none)').matches;
}

export default hasHoverSupport;
