import {act, renderHook, waitFor} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';
import useSyncModalWithHistory from '@components/Modal/useSyncModalWithHistory';

import useCloseDomainAccountModal from '@hooks/useCloseDomainAccountModal';

import Navigation from '@libs/Navigation/Navigation';

const mockShowDecisionModal = jest.fn();
const mockShowConfirmModal = jest.fn();
const mockCloseModalByID = jest.fn();

jest.mock('@components/Modal/useSyncModalWithHistory', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({isNavigationReady: jest.fn(() => Promise.resolve())}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useDecisionModal', () => jest.fn(() => ({showDecisionModal: mockShowDecisionModal, closeModalByID: mockCloseModalByID})));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: mockShowConfirmModal})));

type HistoryGuard = Parameters<typeof useSyncModalWithHistory>[0];

// The hook keeps two history entries: the first call is the entry for the whole flow, the second one is for the confirmation
function getLatestGuards(): {flowGuard?: HistoryGuard; confirmGuard?: HistoryGuard} {
    const calls = jest.mocked(useSyncModalWithHistory).mock.calls;
    return {flowGuard: calls.at(-2)?.[0], confirmGuard: calls.at(-1)?.[0]};
}

describe('useCloseDomainAccountModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('resolves with undefined when the choice is dismissed', async () => {
        // Given the admin dismisses the close account choice
        mockShowDecisionModal.mockResolvedValueOnce({action: ModalActions.DISMISS});
        const {result} = renderHook(() => useCloseDomainAccountModal());

        // When the flow is shown
        let shouldForceCloseAccount: boolean | undefined = false;
        await act(async () => {
            shouldForceCloseAccount = await result.current.showCloseAccountModal(1);
        });

        // Then no confirmation follows, the flow ends without a choice, and its history entry is removed
        expect(shouldForceCloseAccount).toBeUndefined();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(getLatestGuards().flowGuard?.isVisible).toBe(false);
    });

    it('resolves with the chosen option after the admin confirms', async () => {
        // Given the admin picks the force close option and then confirms
        mockShowDecisionModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});
        mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});
        const {result} = renderHook(() => useCloseDomainAccountModal());

        // When the flow is shown
        const onResolved = jest.fn();
        act(() => {
            result.current.showCloseAccountModal(2).then(onResolved);
        });

        // Then it resolves as a force close only after both history entries are removed, so the caller's navigation comes after them
        await waitFor(() => expect(onResolved).toHaveBeenCalledWith(true));
        expect(getLatestGuards().flowGuard?.isVisible).toBe(false);
        expect(getLatestGuards().confirmGuard?.isVisible).toBe(false);
    });

    it('lets the modals leave the history to the flow', async () => {
        // Given the admin picks the safe close option and the confirmation is shown
        mockShowDecisionModal.mockResolvedValueOnce({action: ModalActions.CLOSE});
        mockShowConfirmModal.mockReturnValueOnce(new Promise(() => {}));
        const {result} = renderHook(() => useCloseDomainAccountModal());

        // When the flow is shown
        act(() => {
            result.current.showCloseAccountModal(1);
        });

        // Then neither modal adds its own history entry, and the flow keeps one entry for itself and one for the confirmation
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({shouldHandleNavigationBack: false})));
        expect(mockShowDecisionModal).toHaveBeenCalledWith(expect.objectContaining({shouldHandleNavigationBack: false}));
        expect(getLatestGuards().flowGuard?.isVisible).toBe(true);
        expect(getLatestGuards().confirmGuard?.isVisible).toBe(true);
    });

    it('does not confirm account closure after the page unmounts while navigation is pending', async () => {
        // Given confirmation has finished but history cleanup is still waiting for navigation readiness
        const navigationReady = Promise.withResolvers<void>();
        jest.mocked(Navigation.isNavigationReady).mockReturnValue(navigationReady.promise);
        mockShowDecisionModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});
        mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});
        const {result, unmount} = renderHook(() => useCloseDomainAccountModal());
        const onResolved = jest.fn();
        act(() => {
            result.current.showCloseAccountModal(1).then(onResolved);
        });
        await waitFor(() => expect(getLatestGuards().flowGuard?.isVisible).toBe(false));

        // When the page leaves before navigation becomes ready
        unmount();
        await act(async () => {
            navigationReady.resolve();
            await navigationReady.promise;
        });

        // Then the caller cannot close an account or navigate using a stale confirmation
        expect(onResolved).toHaveBeenCalledWith(undefined);
        jest.mocked(Navigation.isNavigationReady).mockResolvedValue(undefined);
    });

    it('returns to the choice when browser Back closes the confirmation', async () => {
        // Given the admin picks the safe close option and the confirmation is shown
        mockShowDecisionModal.mockResolvedValueOnce({action: ModalActions.CLOSE}).mockReturnValueOnce(new Promise(() => {}));
        mockShowConfirmModal.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    mockCloseModalByID.mockImplementationOnce((id: string, data: unknown) => resolve(data));
                }),
        );
        const {result} = renderHook(() => useCloseDomainAccountModal());
        act(() => {
            result.current.showCloseAccountModal(1);
        });
        await waitFor(() => expect(getLatestGuards().confirmGuard?.isVisible).toBe(true));

        // When browser Back removes the confirmation's history entry
        act(() => {
            getLatestGuards().confirmGuard?.onClose?.();
        });

        // Then the confirmation closes and the choice is shown again, while the flow keeps its own entry for the next Back
        expect(mockCloseModalByID).toHaveBeenCalledWith(expect.any(String), {action: ModalActions.CLOSE});
        await waitFor(() => expect(mockShowDecisionModal).toHaveBeenCalledTimes(2));
        expect(getLatestGuards().flowGuard?.isVisible).toBe(true);
        expect(getLatestGuards().confirmGuard?.isVisible).toBe(false);
    });

    it('dismisses the choice when browser Back removes the flow entry', async () => {
        // Given the close account choice is shown
        mockShowDecisionModal.mockReturnValueOnce(new Promise(() => {}));
        const {result} = renderHook(() => useCloseDomainAccountModal());
        act(() => {
            result.current.showCloseAccountModal(1);
        });
        await waitFor(() => expect(getLatestGuards().flowGuard?.isVisible).toBe(true));

        // When browser Back removes the flow's history entry
        act(() => {
            getLatestGuards().flowGuard?.onClose?.();
        });

        // Then the choice is dismissed, so the flow ends and the page stays where it was
        expect(mockCloseModalByID).toHaveBeenCalledWith(expect.any(String), {action: ModalActions.DISMISS});
    });
});
