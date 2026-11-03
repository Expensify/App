import useIsHiddenWideTabPreMount from './useIsHiddenWideTabPreMount';
import useIsInPreloadedTab from './useIsInPreloadedTab';

/**
 * True while the report screen is mounted where the user cannot see it: in a preloaded tab, or as a hidden wide submit
 * pre-mount. Work that assumes the user is looking, such as marking the report as read, waits until it turns false.
 */
function useIsReportOutOfSight(): boolean {
    const isInPreloadedTab = useIsInPreloadedTab();
    const isHiddenPreMount = useIsHiddenWideTabPreMount();
    return isInPreloadedTab || isHiddenPreMount;
}

export default useIsReportOutOfSight;
