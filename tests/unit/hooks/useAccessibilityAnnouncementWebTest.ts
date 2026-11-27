import {renderHook} from '@testing-library/react-native';

import CONST from '@src/CONST';

// The web implementation is loaded explicitly, because Jest resolves the hook to its native variant.
const useAccessibilityAnnouncement = jest.requireActual<{default: (message: string, shouldAnnounceMessage: boolean, options?: {shouldAnnounceOnWeb?: boolean}) => void}>(
    '@hooks/useAccessibilityAnnouncement/index.ts',
).default;

describe('useAccessibilityAnnouncement (web)', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('masks the live region in FullStory', () => {
        // Given an announcement that repeats what the user typed into a search, which can be a card number
        const message = 'No results found matching "4111111111111111"';

        // When it is announced on web
        renderHook(() => useAccessibilityAnnouncement(message, true, {shouldAnnounceOnWeb: true}));
        jest.runAllTimers();

        // Then the live region holding it is masked, because it sits outside the app's FullStory classes
        const liveRegion = document.querySelector('[aria-live]');
        expect(liveRegion?.textContent).toBe(message);
        expect(liveRegion?.classList.contains(CONST.FULLSTORY.CLASS.MASK)).toBe(true);
    });
});
