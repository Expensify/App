import CONST from '@src/CONST';
import useAccessibilityAnnouncement from './useAccessibilityAnnouncement';
import useDebouncedValue from './useDebouncedValue';

/**
 * Encapsulates the debounced accessibility announcement pattern:
 * waits for a typing pause before announcing a message via screen reader.
 *
 * On web, the returned `key` and `role` should be spread onto the Text element
 * to force a remount that re-triggers `role="alert"`.
 * On native, announcements are made programmatically via AccessibilityInfo.
 */
function useDebouncedAccessibilityAnnouncement(message: string, shouldAnnounce: boolean, searchValue: string) {
    const debouncedSearchValue = useDebouncedValue(searchValue, CONST.TIMING.ACCESSIBILITY_ANNOUNCEMENT_DEBOUNCE_TIME);
    const hasFinishedTyping = searchValue === debouncedSearchValue;
    const shouldAnnounceNow = shouldAnnounce && hasFinishedTyping;

    useAccessibilityAnnouncement(message, shouldAnnounceNow, {shouldAnnounceOnNative: true});

    return {hasFinishedTyping, debouncedSearchValue, shouldAnnounceNow};
}

export default useDebouncedAccessibilityAnnouncement;
