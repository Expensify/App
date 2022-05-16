/**
 * Allows us to identify whether the platform is hoverable.
 *
 * @returns {Boolean}
 */

import * as Browser from '../Browser';

const hasHoverSupport = () => !Browser.isMobile();

export default hasHoverSupport;

