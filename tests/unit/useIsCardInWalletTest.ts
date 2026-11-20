import {act, renderHook} from '@testing-library/react-native';

import useIsCardInWallet from '@components/AddToWalletButton/useIsCardInWallet';

import CONST from '@src/CONST';

import {createRandomExpensifyCard} from '../utils/collections/card';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type PendingRead = {resolve: (isInWallet: boolean) => void};

const mockPendingReads: PendingRead[] = [];
let mockAppFocusCallback: (() => void) | undefined;

jest.mock('@libs/Wallet', () => ({
    checkIfWalletIsAvailable: () => Promise.resolve(true),
    isCardInWallet: () =>
        new Promise<boolean>((resolve) => {
            mockPendingReads.push({resolve});
        }),
}));

jest.mock('@hooks/useAppFocusEvent', () => (callback: () => void) => {
    mockAppFocusCallback = callback;
});

const card = createRandomExpensifyCard(1, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});

describe('useIsCardInWallet', () => {
    beforeEach(() => {
        mockPendingReads.length = 0;
        mockAppFocusCallback = undefined;
    });

    it('settles a refresh only after the newest wallet read, so the Add button does not flash back', async () => {
        // Given the hook finished its initial read with the card not in the wallet
        const {result} = renderHook(() => useIsCardInWallet(card));
        await act(async () => {
            mockPendingReads.at(0)?.resolve(false);
            await waitForBatchedUpdates();
        });
        expect(result.current.isInWallet).toBe(false);

        // When the success refresh starts, then the app focus refresh starts before the first one resolves
        const onRefreshSettled = jest.fn();
        act(() => {
            result.current.refreshWalletStatus().then(onRefreshSettled);
            mockAppFocusCallback?.();
        });
        expect(mockPendingReads).toHaveLength(3);

        // And the older read resolves first
        await act(async () => {
            mockPendingReads.at(1)?.resolve(true);
            await waitForBatchedUpdates();
        });

        // Then the success refresh keeps waiting and the stale result is not applied
        expect(onRefreshSettled).not.toHaveBeenCalled();
        expect(result.current.isInWallet).toBe(false);

        // When the newest read resolves
        await act(async () => {
            mockPendingReads.at(2)?.resolve(true);
            await waitForBatchedUpdates();
        });

        // Then the success refresh settles with the newest status applied
        expect(onRefreshSettled).toHaveBeenCalledTimes(1);
        expect(result.current.isInWallet).toBe(true);
    });
});
