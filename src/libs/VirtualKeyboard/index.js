import _ from 'underscore';
import * as Browser from '../Browser';

/**
 * Is the virtual keyboard open?
 *
 * @returns {Boolean|null} – null if the VirtualKeyboard API is unavailable
 */
function isOpen() {
    if (!_.has(navigator, 'virtualKeyboard')) {
        return null;
    }
    return navigator.virtualKeyboard.boundingRect.y > 0;
}

/**
 * As of January 2022, the VirtualKeyboard web API is not available in all browsers yet
 * If it is unavailable, we default to assuming that the virtual keyboard is open on mobile devices.
 * See https://github.com/Expensify/App/issues/6767 for additional context.
 *
 * @returns {Boolean}
 */
function shouldAssumeIsOpen() {
    const isOpened = isOpen();
    return _.isNull(isOpened) ? Browser.isMobile() : isOpened;
}

export default {
    isOpen,
    shouldAssumeIsOpen,
};
