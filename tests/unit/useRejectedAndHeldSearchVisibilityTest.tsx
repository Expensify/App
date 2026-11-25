import {act, renderHook} from '@testing-library/react-native';

import useHasHeldExpense from '@hooks/useHasHeldExpense';
import useHasRejectedExpense from '@hooks/useHasRejectedExpense';
import useRejectedAndHeldSearchVisibility from '@hooks/useRejectedAndHeldSearchVisibility';

import {setHasSeenHeldSuggestedSearch, setHasSeenRejectedSuggestedSearch} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useHasHeldExpense');
jest.mock('@hooks/useHasRejectedExpense');
jest.mock('@libs/actions/Search', () => ({setHasSeenHeldSuggestedSearch: jest.fn(), setHasSeenRejectedSuggestedSearch: jest.fn()}));

describe('useRejectedAndHeldSearchVisibility', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(useHasHeldExpense).mockReturnValue(false);
        jest.mocked(useHasRejectedExpense).mockReturnValue(false);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('hides both suggestions before the first relevant expense', async () => {
        // Given neither an expense nor a previously synced visibility flag
        // When the visibility hook mounts
        const {result} = renderHook(() => useRejectedAndHeldSearchVisibility());
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then neither suggestion is visible or persisted
        expect(result.current).toEqual({shouldShowRejectedSuggestion: false, shouldShowHeldSuggestion: false});
        expect(setHasSeenRejectedSuggestedSearch).not.toHaveBeenCalled();
        expect(setHasSeenHeldSuggestedSearch).not.toHaveBeenCalled();
    });

    it.each([
        {kind: 'rejected', key: ONYXKEYS.NVP_HAS_SEEN_REJECTED_SUGGESTED_SEARCH, detection: useHasRejectedExpense, persist: setHasSeenRejectedSuggestedSearch},
        {kind: 'held', key: ONYXKEYS.NVP_HAS_SEEN_HELD_SUGGESTED_SEARCH, detection: useHasHeldExpense, persist: setHasSeenHeldSuggestedSearch},
    ])('persists $kind visibility and retains it after resolution and remount', async ({key, detection, persist, kind}) => {
        // Given the first relevant expense is detected
        jest.mocked(detection).mockReturnValue(true);
        const {result, rerender, unmount} = renderHook(() => useRejectedAndHeldSearchVisibility());
        await act(async () => {
            await waitForBatchedUpdates();
        });
        expect(persist).toHaveBeenCalledTimes(1);

        // When the persisted flag arrives and the expense is resolved
        await act(async () => {
            await Onyx.set(key, true);
            jest.mocked(detection).mockReturnValue(false);
            await waitForBatchedUpdates();
        });
        rerender({});
        const expected = {shouldShowRejectedSuggestion: kind === 'rejected', shouldShowHeldSuggestion: kind === 'held'};

        // Then visibility survives both resolution and a fresh mount without another write
        expect(result.current).toEqual(expected);
        unmount();
        const remounted = renderHook(() => useRejectedAndHeldSearchVisibility());
        await act(async () => {
            await waitForBatchedUpdates();
        });
        expect(remounted.result.current).toEqual(expected);
        expect(persist).toHaveBeenCalledTimes(1);
    });
});
