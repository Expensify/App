import Visibility from './Visibility';

/**
 * When the app is visible and the LHN is not opening in small-screen devices we can assume that the report is fully visible.
 *
 * @param {Boolean} isDrawerOpen
 * @param {Boolean} isSmallScreenWidth
 *
 * @returns {Boolean}
 */
export default function getIsReportFullyVisible(isDrawerOpen, isSmallScreenWidth) {
    const isSidebarCoveringReportView = isSmallScreenWidth && isDrawerOpen;
    return Visibility.isVisible() && !isSidebarCoveringReportView;
}
