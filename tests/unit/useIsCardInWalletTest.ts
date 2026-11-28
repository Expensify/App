import {act, renderHook} from '@testing-library/react-native';

import useIsCardInWallet from '@components/AddToWalletButton/useIsCardInWallet';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

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
const otherCard = createRandomExpensifyCard(2, {state: CONST.EXPENSIFY_CARD.STATE.OPEN});

describe('useIsCardInWallet', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockPendingReads.length = 0;
        mockAppFocusCallback = undefined;
        await Onyx.clear();
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
    it('shares a refresh started in one place with every other place showing the same card', async () => {
        // Given the Add button and the status text each use the hook for the same card, both seeing it as not in the wallet
        const {result: button} = renderHook(() => useIsCardInWallet(card));
        const {result: statusText} = renderHook(() => useIsCardInWallet(card));
        await act(async () => {
            for (const read of mockPendingReads) {
                read.resolve(false);
            }
            await waitForBatchedUpdates();
        });
        expect(statusText.current.isInWallet).toBe(false);

        // When only the button refreshes, as it does right after a successful add
        act(() => {
            button.current.refreshWalletStatus();
        });
        await act(async () => {
            mockPendingReads.at(-1)?.resolve(true);
            await waitForBatchedUpdates();
        });

        // Then the status text picks up the new status too, so it never stays hidden next to a hidden button
        expect(button.current.isInWallet).toBe(true);
        expect(statusText.current.isInWallet).toBe(true);
    });
    it('keeps reads of different cards apart, so a newer read of one card does not drop a read of another', async () => {
        // Given two cards on screen, both read as not in the wallet
        const {result: first} = renderHook(() => useIsCardInWallet(card));
        const {result: second} = renderHook(() => useIsCardInWallet(otherCard));
        await act(async () => {
            for (const read of mockPendingReads) {
                read.resolve(false);
            }
            await waitForBatchedUpdates();
        });

        // When the first card refreshes, then the second one does, and the first read resolves last
        act(() => {
            first.current.refreshWalletStatus();
        });
        const firstCardRead = mockPendingReads.at(-1);
        act(() => {
            second.current.refreshWalletStatus();
        });
        await act(async () => {
            mockPendingReads.at(-1)?.resolve(false);
            firstCardRead?.resolve(true);
            await waitForBatchedUpdates();
        });

        // Then each card keeps its own newest result, since the newer read belongs to another card
        expect(first.current.isInWallet).toBe(true);
        expect(second.current.isInWallet).toBe(false);
    });
    it('does not show a status stored on an earlier visit until the wallet is read again', async () => {
        // Given an earlier visit stored the card as not in the wallet, and the user added it in the wallet app since then
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_CARD_WALLET_STATUS}${card.cardID}`, {isInWallet: false});

        // When the page mounts again and its wallet read is still in flight
        const {result} = renderHook(() => useIsCardInWallet(card));
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then the stale "not in wallet" is not used, so the Add button can't offer a card that is already added
        expect(result.current.isInWallet).toBeNull();

        // And the fresh read decides once it resolves
        await act(async () => {
            mockPendingReads.at(-1)?.resolve(true);
            await waitForBatchedUpdates();
        });
        expect(result.current.isInWallet).toBe(true);
    });

    it('keeps the newest read when an older read from another place showing the card resolves last', async () => {
        // Given the Add button and the status text for the same card, both read as not in the wallet
        const {result: button} = renderHook(() => useIsCardInWallet(card));
        const {result: statusText} = renderHook(() => useIsCardInWallet(card));
        await act(async () => {
            for (const read of mockPendingReads) {
                read.resolve(false);
            }
            await waitForBatchedUpdates();
        });

        // When the text starts a read, the button starts a newer one after an add, and the newer one resolves first
        act(() => {
            statusText.current.refreshWalletStatus();
        });
        const olderRead = mockPendingReads.at(-1);
        act(() => {
            button.current.refreshWalletStatus();
        });
        await act(async () => {
            mockPendingReads.at(-1)?.resolve(true);
            await waitForBatchedUpdates();
        });
        await act(async () => {
            olderRead?.resolve(false);
            await waitForBatchedUpdates();
        });

        // Then the older "not in wallet" from the text does not overwrite the newer result for either of them
        expect(button.current.isInWallet).toBe(true);
        expect(statusText.current.isInWallet).toBe(true);
    });
    it('waits for a fresh read again when the hook switches to another card', async () => {
        // Given the hook showed the first card after its read, and an earlier visit stored the second card as not in the wallet
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_CARD_WALLET_STATUS}${otherCard.cardID}`, {isInWallet: false});
        const {result, rerender} = renderHook(({hookCard}) => useIsCardInWallet(hookCard), {initialProps: {hookCard: card}});
        await act(async () => {
            mockPendingReads.at(-1)?.resolve(true);
            await waitForBatchedUpdates();
        });
        expect(result.current.isInWallet).toBe(true);

        // When the page switches the hook to the second card while its read is still in flight
        rerender({hookCard: otherCard});
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Then the stored status of the second card is not trusted until its own read resolves
        expect(result.current.isInWallet).toBeNull();
        await act(async () => {
            mockPendingReads.at(-1)?.resolve(true);
            await waitForBatchedUpdates();
        });
        expect(result.current.isInWallet).toBe(true);
    });
    it('shows the status from an app focus read that finishes before the initial read', async () => {
        // Given the initial read is still in flight
        const {result} = renderHook(() => useIsCardInWallet(card));

        // When the app regains focus and that newer read finishes first
        act(() => {
            mockAppFocusCallback?.();
        });
        await act(async () => {
            mockPendingReads.at(-1)?.resolve(true);
            await waitForBatchedUpdates();
        });

        // Then its fresh status shows without waiting for the obsolete initial read
        expect(result.current.isInWallet).toBe(true);
    });

    it('ignores a read of the previous card that finishes after the switch', async () => {
        // Given the hook switched from the first card to the second one before the first card's read finished
        const {result, rerender} = renderHook(({hookCard}) => useIsCardInWallet(hookCard), {initialProps: {hookCard: card}});
        const firstCardRead = mockPendingReads.at(-1);
        rerender({hookCard: otherCard});

        // When the second card's read finishes first, and the first card's read finishes only after it
        await act(async () => {
            mockPendingReads.at(-1)?.resolve(true);
            await waitForBatchedUpdates();
        });
        await act(async () => {
            firstCardRead?.resolve(false);
            await waitForBatchedUpdates();
        });

        // Then the late read of the first card does not hide the second card's status
        expect(result.current.isInWallet).toBe(true);
    });
});
