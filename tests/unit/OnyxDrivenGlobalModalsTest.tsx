import {act, renderHook} from '@testing-library/react-native';

import useScreenShareRequestPrompt from '@hooks/useScreenShareRequestPrompt';
import useUpdateAppPrompt from '@hooks/useUpdateAppPrompt';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockCloseModal, MockModalActions, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

// Both hooks render nothing and push their prompt onto the global modal stack, so what they pushed -- and how many
// times -- is the only observable behaviour there is to assert on.
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

// Both actions are stubbed -- `joinScreenShare` opens an OldDot tab, and the clearing of SCREEN_SHARE_REQUEST that they
// both do is driven from the tests instead, so it is explicit which request the hook is looking at.
const mockJoinScreenShare = jest.fn<void, [string, string]>();
const mockClearScreenShareRequest = jest.fn();
jest.mock('@userActions/User', () => ({
    __esModule: true,
    joinScreenShare: (accessToken: string, roomName: string) => {
        mockJoinScreenShare(accessToken, roomName);
    },
    clearScreenShareRequest: () => {
        mockClearScreenShareRequest();
    },
}));

const SCREEN_SHARE_REQUEST = {accessToken: 'token-1', roomName: 'room-1'};

async function setScreenShareRequest(request: typeof SCREEN_SHARE_REQUEST | null) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.SCREEN_SHARE_REQUEST, request);
    });
    await waitForBatchedUpdates();
}

describe('Onyx-driven global modal prompts', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        resetMockConfirmModal();
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('useUpdateAppPrompt', () => {
        it('should not show the prompt while no update is available', async () => {
            renderHook(() => useUpdateAppPrompt());
            await waitForBatchedUpdates();

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('should show the prompt with the update copy once an update becomes available', async () => {
            renderHook(() => useUpdateAppPrompt());
            await waitForBatchedUpdates();

            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE, true);
            });
            await waitForBatchedUpdates();

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(getShowConfirmModalOption('title')).toBe('baseUpdateAppModal.updateApp');
            expect(getShowConfirmModalOption('prompt')).toBe('baseUpdateAppModal.updatePrompt');
            expect(getShowConfirmModalOption('confirmText')).toBe('baseUpdateAppModal.updateApp');
            expect(getShowConfirmModalOption('cancelText')).toBe('common.cancel');
        });

        it('should not show the prompt again after it has been dismissed', async () => {
            const {rerender} = renderHook(() => useUpdateAppPrompt());
            await waitForBatchedUpdates();

            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE, true);
            });
            await waitForBatchedUpdates();

            // The Onyx flag stays `true` forever, so nothing but the hook's own guard keeps this to one showing.
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();

            rerender({});
            await waitForBatchedUpdates();

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('useScreenShareRequestPrompt', () => {
        it('should not show the prompt while there is no request', async () => {
            renderHook(() => useScreenShareRequestPrompt());
            await waitForBatchedUpdates();

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('should show the prompt with the screen-share copy when a request arrives', async () => {
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(getShowConfirmModalOption('title')).toBe('guides.screenShare');
            expect(getShowConfirmModalOption('prompt')).toBe('guides.screenShareRequest');
            expect(getShowConfirmModalOption('confirmText')).toBe('common.join');
            expect(getShowConfirmModalOption('cancelText')).toBe('common.decline');
        });

        it('should join the screen share with the request credentials on confirm', async () => {
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();

            expect(mockJoinScreenShare).toHaveBeenCalledWith(SCREEN_SHARE_REQUEST.accessToken, SCREEN_SHARE_REQUEST.roomName);
            expect(mockClearScreenShareRequest).not.toHaveBeenCalled();
        });

        it('should clear the request without joining on decline', async () => {
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();

            expect(mockJoinScreenShare).not.toHaveBeenCalled();
            expect(mockClearScreenShareRequest).toHaveBeenCalledTimes(1);
        });

        it('should not stack a second prompt on top of one that is already open', async () => {
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);
            await setScreenShareRequest({accessToken: 'token-2', roomName: 'room-2'});

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

            // The replacement request is the one that is current when the user answers, so it is the one that is joined.
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();

            expect(mockJoinScreenShare).toHaveBeenCalledWith('token-2', 'room-2');
        });

        it('should close the prompt when the request is cleared while it is still open', async () => {
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            // Nothing answers the prompt here -- the key disappears on its own, as it does when logout calls
            // `Onyx.clear()`.
            await setScreenShareRequest(null);

            expect(mockCloseModal).toHaveBeenCalledTimes(1);
            expect(mockJoinScreenShare).not.toHaveBeenCalled();
        });

        it('should not close anything when the request is cleared after the user already answered', async () => {
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            // Declining pops the entry itself, so the clear that follows must not pop a second time -- by then the top
            // of the stack is whatever unrelated modal is open.
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();
            await setScreenShareRequest(null);

            expect(mockCloseModal).not.toHaveBeenCalled();
        });

        it('should show a prompt again for a request that arrives after the previous one was answered', async () => {
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();
            await setScreenShareRequest(null);

            await setScreenShareRequest({accessToken: 'token-2', roomName: 'room-2'});

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        });
    });

    describe('prompt ordering', () => {
        it('should run the update prompt effect last so it sits above the screen-share prompt', async () => {
            // DeferredGlobalModals calls the hooks in this order on purpose: only the top of the modal stack renders,
            // so whichever effect runs last owns the prompt the user sees when both are pending at once.
            renderHook(() => {
                useScreenShareRequestPrompt();
                useUpdateAppPrompt();
            });
            await waitForBatchedUpdates();

            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SCREEN_SHARE_REQUEST]: SCREEN_SHARE_REQUEST,
                    [ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE]: true,
                });
            });
            await waitForBatchedUpdates();

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
            expect(mockShowConfirmModal.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({title: 'guides.screenShare'}));
            expect(mockShowConfirmModal.mock.calls.at(1)?.at(0)).toEqual(expect.objectContaining({title: 'baseUpdateAppModal.updateApp'}));
        });
    });
});
