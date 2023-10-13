import Visibility from './Visibility';

/**
 * When the app is visible and the report screen is focused we can assume that the report is fully visible.
 */
export default function getIsReportFullyVisible(isFocused: boolean): boolean {
    return Visibility.isVisible() && isFocused;
}
