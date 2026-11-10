import {act, renderHook} from '@testing-library/react-native';

import LockedAccountModalProvider, {useLockedAccountActions} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React from 'react';

const mockShowConfirmModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [{isLocked: true}]));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

describe('LockedAccountModalProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([ModalActions.CONFIRM, ModalActions.CLOSE])('only opens Concierge on confirmation (%s)', async (action) => {
        // Given a locked account and the user's modal choice.
        mockShowConfirmModal.mockResolvedValue({action});
        const {result} = renderHook(() => useLockedAccountActions(), {wrapper: LockedAccountModalProvider});

        // When a restricted action opens the locked account modal.
        await act(async () => {
            result.current.showLockedAccountModal();
        });

        // Then the primary CTA opens Concierge, while dismissing stays on the current screen.
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                confirmText: 'unlockAccountPage.chatWithConcierge',
                cancelText: 'common.dismiss',
                shouldShowCancelButton: true,
            }),
        );
        if (action === ModalActions.CONFIRM) {
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.CONCIERGE);
        } else {
            expect(Navigation.navigate).not.toHaveBeenCalled();
        }
    });
});
