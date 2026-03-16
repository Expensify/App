import CONST from '@src/CONST';
import useAccessibilityAnnouncement from './useAccessibilityAnnouncement';
import useDebouncedValue from './useDebouncedValue';

/**
 * Announces a message after typing pauses, on both native and web.
 */
function useDebouncedAccessibilityAnnouncement(message: string, shouldAnnounce: boolean, searchValue: string) {
    const debouncedSearchValue = useDebouncedValue(searchValue, CONST.TIMING.ACCESSIBILITY_ANNOUNCEMENT_DEBOUNCE_TIME);
    const hasFinishedTyping = searchValue === debouncedSearchValue;
    const shouldAnnounceNow = shouldAnnounce && hasFinishedTyping;

    useAccessibilityAnnouncement(message, shouldAnnounceNow, {shouldAnnounceOnNative: true, shouldAnnounceOnWeb: true});
}

export default useDebouncedAccessibilityAnnouncement;
