import {act, renderHook} from '@testing-library/react-native';

import useShareSavedSearch from '@hooks/useShareSavedSearch';

import Clipboard from '@libs/Clipboard';

import ROUTES from '@src/ROUTES';

jest.mock('@libs/Clipboard', () => ({
    setString: jest.fn(),
}));

jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({environmentURL: 'https://new.expensify.com'})));

const mockClipboardSetString = Clipboard.setString as jest.MockedFunction<typeof Clipboard.setString>;

const ITEM_ID = '12345';
const ITEM_QUERY = 'type:expense status:all';

describe('useShareSavedSearch', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockClipboardSetString.mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('copies the correct URL to clipboard and sets copiedID', () => {
        const {result} = renderHook(() => useShareSavedSearch());

        act(() => {
            result.current.handleShare(ITEM_ID, ITEM_QUERY);
        });

        const expectedURL = `https://new.expensify.com/${ROUTES.SEARCH_ROOT.getRoute({query: ITEM_QUERY})}`;
        expect(mockClipboardSetString).toHaveBeenCalledWith(expectedURL);
        expect(result.current.copiedID).toBe(ITEM_ID);
    });

    it('resets copiedID to null after 1800ms', () => {
        const {result} = renderHook(() => useShareSavedSearch());

        act(() => {
            result.current.handleShare(ITEM_ID, ITEM_QUERY);
        });

        expect(result.current.copiedID).toBe(ITEM_ID);

        act(() => {
            jest.advanceTimersByTime(1800);
        });

        expect(result.current.copiedID).toBeNull();
    });

    it('does not reset copiedID before 1800ms elapses', () => {
        const {result} = renderHook(() => useShareSavedSearch());

        act(() => {
            result.current.handleShare(ITEM_ID, ITEM_QUERY);
        });

        act(() => {
            jest.advanceTimersByTime(1799);
        });

        expect(result.current.copiedID).toBe(ITEM_ID);
    });

    it('resets timer when handleShare is called again before timeout', () => {
        const {result} = renderHook(() => useShareSavedSearch());
        const secondID = '99999';

        act(() => {
            result.current.handleShare(ITEM_ID, ITEM_QUERY);
        });

        act(() => {
            jest.advanceTimersByTime(1000);
            result.current.handleShare(secondID, ITEM_QUERY);
        });

        // First hash should be replaced by second
        expect(result.current.copiedID).toBe(secondID);

        // Advancing 1800ms from second call — should reset
        act(() => {
            jest.advanceTimersByTime(1800);
        });

        expect(result.current.copiedID).toBeNull();
    });

    it('clears timer on unmount without calling setState', () => {
        const {result, unmount} = renderHook(() => useShareSavedSearch());

        act(() => {
            result.current.handleShare(ITEM_ID, ITEM_QUERY);
        });

        // Unmount before timer fires
        unmount();

        // Advancing past timeout should not throw
        expect(() => {
            act(() => {
                jest.advanceTimersByTime(1800);
            });
        }).not.toThrow();
    });
});
