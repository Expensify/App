import Visibility from './Visibility';

/**
 * When the app is visible and the report screen is focused we can assume that the report is fully visible.
 *
 * @param {Boolean} isFocused
 *
 * @returns {Boolean}
 */
export default function getIsReportFullyVisible(isFocused) {
    return Visibility.isVisible() && isFocused;
}
