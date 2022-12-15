import _ from 'underscore';
import * as Browser from '../Browser';

/**
 * As of January 2022, the VirtualKeyboard web API is not available in all browsers yet
 * If it is unavailable, we default to assuming that the virtual keyboard is open on mobile devices.
 * See https://github.com/Expensify/App/issues/6767 for additional context.
 *
 * @returns {Boolean}
 */
function shouldAssumeIsOpen() {
    return Browser.isMobile();
}

export default {
    shouldAssumeIsOpen,
};
