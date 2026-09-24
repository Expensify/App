import {act, renderHook} from '@testing-library/react-native';

import useScreenShareRequestPrompt from '@hooks/useScreenShareRequestPrompt';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockCloseModalByID, MockModalActions, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

// The hook renders nothing and pushes its prompt onto the global modal stack, so what it pushed -- and how many
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

// Has to match the id the hook pushes its prompt under, because closing the right entry is the behaviour under test.
const SCREEN_SHARE_REQUEST_MODAL_ID = 'screenShareRequest';

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

    describe('useScreenShareRequestPrompt', () => {
        it('should not show the prompt while there is no request', async () => {
            // Given an app that has been running with no GuidesPlus agent asking for a screen share
            // When the hook mounts
            renderHook(() => useScreenShareRequestPrompt());
            await waitForBatchedUpdates();

            // Then no prompt is pushed, because an unprompted modal on startup would block the whole app
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('should show the prompt with the screen-share copy when a request arrives', async () => {
            // Given the hook mounted with nothing to ask about yet
            renderHook(() => useScreenShareRequestPrompt());

            // When a GuidesPlus agent raises a request, which the agent does by writing SCREEN_SHARE_REQUEST
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            // Then one prompt carries the screen-share copy, so the user can tell what they are agreeing to
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(getShowConfirmModalOption('title')).toBe('guides.screenShare');
            expect(getShowConfirmModalOption('prompt')).toBe('guides.screenShareRequest');
            expect(getShowConfirmModalOption('confirmText')).toBe('common.join');
            expect(getShowConfirmModalOption('cancelText')).toBe('common.decline');
        });

        it('should push the prompt under its own id so it can be closed without touching other modals', async () => {
            // Given the hook mounted with nothing to ask about yet
            renderHook(() => useScreenShareRequestPrompt());

            // When a request raises the prompt
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            // Then it is named, because the hook has to be able to take down its own entry rather than the top of the
            // stack, which by then may be an unrelated modal the user opened on top of the prompt
            expect(getShowConfirmModalOption('id')).toBe(SCREEN_SHARE_REQUEST_MODAL_ID);
        });

        it('should join the screen share with the request credentials on confirm', async () => {
            // Given a prompt raised by a request that carries the room to join
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            // When the user presses Join
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();

            // Then that request's credentials are the ones used, and the key is left for `joinScreenShare` to clear
            expect(mockJoinScreenShare).toHaveBeenCalledWith(SCREEN_SHARE_REQUEST.accessToken, SCREEN_SHARE_REQUEST.roomName);
            expect(mockClearScreenShareRequest).not.toHaveBeenCalled();
        });

        it('should clear the request without joining on decline', async () => {
            // Given a prompt raised by a pending request
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            // When the user presses Decline
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();

            // Then nothing is joined, and the request is cleared so the same one cannot prompt again
            expect(mockJoinScreenShare).not.toHaveBeenCalled();
            expect(mockClearScreenShareRequest).toHaveBeenCalledTimes(1);
        });

        it('should not stack a second prompt on top of one that is already open', async () => {
            // Given a prompt already open for the first request
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            // When a second agent request replaces the first while the user is still deciding
            await setScreenShareRequest({accessToken: 'token-2', roomName: 'room-2'});

            // Then the user is still looking at a single prompt, rather than having to dismiss one per request
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

            // When the user answers that prompt
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();

            // Then the room joined is the one that is current at answer time, not the stale one the prompt was raised
            // for, because joining a superseded room would drop the agent who is actually waiting
            expect(mockJoinScreenShare).toHaveBeenCalledWith('token-2', 'room-2');
        });

        it('should close the prompt when the request is cleared while it is still open', async () => {
            // Given a prompt open and unanswered
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            // When the request disappears on its own, as it does when logging out calls `Onyx.clear()`
            await setScreenShareRequest(null);

            // Then the hook takes down its own entry by id, because a prompt for a request nobody is waiting on would
            // otherwise sit over the signed-out screen
            expect(mockCloseModalByID).toHaveBeenCalledTimes(1);
            expect(mockCloseModalByID).toHaveBeenCalledWith(SCREEN_SHARE_REQUEST_MODAL_ID);
            expect(mockJoinScreenShare).not.toHaveBeenCalled();
        });

        it('should not close anything when the request is cleared after the user already answered', async () => {
            // Given a prompt the user has already declined, which takes the entry down and then clears the key
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();

            // When the clear that follows the decline lands
            await setScreenShareRequest(null);

            // Then no close is issued, because the hook no longer owns anything on the stack
            expect(mockCloseModalByID).not.toHaveBeenCalled();
        });

        it('should show a prompt again for a request that arrives after the previous one was answered', async () => {
            // Given a first request that the user has answered and that has been cleared
            renderHook(() => useScreenShareRequestPrompt());
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();
            await setScreenShareRequest(null);

            // When a later, unrelated request arrives
            await setScreenShareRequest({accessToken: 'token-2', roomName: 'room-2'});

            // Then it gets its own prompt, because reusing the id must not make the second request unanswerable
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        });
    });
});
