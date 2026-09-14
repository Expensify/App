import {act, render} from '@testing-library/react-native';

import ScreenShareRequestModal from '@components/ScreenShareRequestModal';
import UpdateAppModal from '@components/UpdateAppModal';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, MockModalActions, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

// Both controllers render null and push their prompt onto the global modal stack, so what they pushed -- and how many
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
// both do is driven from the tests instead, so it is explicit which request the controller is looking at.
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

describe('Onyx-driven global modal controllers', () => {
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

    describe('UpdateAppModal', () => {
        it('should not show the prompt while no update is available', async () => {
            render(<UpdateAppModal />);
            await waitForBatchedUpdates();

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('should show the prompt with the update copy once an update becomes available', async () => {
            render(<UpdateAppModal />);
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
            const {rerender} = render(<UpdateAppModal />);
            await waitForBatchedUpdates();

            await act(async () => {
                await Onyx.set(ONYXKEYS.RAM_ONLY_UPDATE_AVAILABLE, true);
            });
            await waitForBatchedUpdates();

            // The Onyx flag stays `true` forever, so nothing but the controller's own guard keeps this to one showing.
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();

            rerender(<UpdateAppModal />);
            await waitForBatchedUpdates();

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('ScreenShareRequestModal', () => {
        it('should not show the prompt while there is no request', async () => {
            render(<ScreenShareRequestModal />);
            await waitForBatchedUpdates();

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('should show the prompt with the screen-share copy when a request arrives', async () => {
            render(<ScreenShareRequestModal />);
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(getShowConfirmModalOption('title')).toBe('guides.screenShare');
            expect(getShowConfirmModalOption('prompt')).toBe('guides.screenShareRequest');
            expect(getShowConfirmModalOption('confirmText')).toBe('common.join');
            expect(getShowConfirmModalOption('cancelText')).toBe('common.decline');
        });

        it('should join the screen share with the request credentials on confirm', async () => {
            render(<ScreenShareRequestModal />);
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();

            expect(mockJoinScreenShare).toHaveBeenCalledWith(SCREEN_SHARE_REQUEST.accessToken, SCREEN_SHARE_REQUEST.roomName);
            expect(mockClearScreenShareRequest).not.toHaveBeenCalled();
        });

        it('should clear the request without joining on decline', async () => {
            render(<ScreenShareRequestModal />);
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();

            expect(mockJoinScreenShare).not.toHaveBeenCalled();
            expect(mockClearScreenShareRequest).toHaveBeenCalledTimes(1);
        });

        it('should not stack a second prompt on top of one that is already open', async () => {
            render(<ScreenShareRequestModal />);
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);
            await setScreenShareRequest({accessToken: 'token-2', roomName: 'room-2'});

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

            // The replacement request is the one that is current when the user answers, so it is the one that is joined.
            resolveShowConfirmModal({action: MockModalActions.CONFIRM});
            await waitForBatchedUpdates();

            expect(mockJoinScreenShare).toHaveBeenCalledWith('token-2', 'room-2');
        });

        it('should show a prompt again for a request that arrives after the previous one was answered', async () => {
            render(<ScreenShareRequestModal />);
            await setScreenShareRequest(SCREEN_SHARE_REQUEST);

            resolveShowConfirmModal({action: MockModalActions.CLOSE});
            await waitForBatchedUpdates();
            await setScreenShareRequest(null);

            await setScreenShareRequest({accessToken: 'token-2', roomName: 'room-2'});

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        });
    });
});
