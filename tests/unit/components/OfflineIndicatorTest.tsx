import {fireEvent, render, screen} from '@testing-library/react-native';

import OfflineIndicator from '@components/OfflineIndicator';

import useConfirmModal from '@hooks/useConfirmModal';
import useIsConnectionBlockedByCertificatePinning from '@hooks/useIsConnectionBlockedByCertificatePinning';
import useNetwork from '@hooks/useNetwork';

import React from 'react';

import createMock from '../../utils/createMock';

jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useIsConnectionBlockedByCertificatePinning', () => jest.fn());
jest.mock('@hooks/useConfirmModal', () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

const mockShowConfirmModal = jest.fn();

function mockState({isOffline, isBlocked}: {isOffline: boolean; isBlocked: boolean}) {
    jest.mocked(useNetwork).mockReturnValue(createMock<ReturnType<typeof useNetwork>>({isOffline}));
    jest.mocked(useIsConnectionBlockedByCertificatePinning).mockReturnValue(isBlocked);
}

describe('OfflineIndicator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useConfirmModal).mockReturnValue(createMock<ReturnType<typeof useConfirmModal>>({showConfirmModal: mockShowConfirmModal}));
    });

    it('shows the usual offline message when the network is simply unavailable', () => {
        // Given the app is offline and certificate pinning blocked nothing
        mockState({isOffline: true, isBlocked: false});

        // When the indicator renders
        render(<OfflineIndicator />);

        // Then the user sees the regular offline copy, not the secure connection explanation
        expect(screen.getByText('common.youAppearToBeOffline')).toBeTruthy();
        expect(screen.queryByText('common.cantConnectSecurely', {exact: false})).toBeNull();
    });

    it('explains that Expensify cannot connect securely and opens the recovery steps', () => {
        // Given the app is offline because certificate pinning blocked our server
        mockState({isOffline: true, isBlocked: true});

        // When the indicator renders and the user asks to learn more
        render(<OfflineIndicator />);
        fireEvent.press(screen.getByText('common.learnMore'), {preventDefault: jest.fn()});

        // Then the offline copy is replaced, and the modal gives the recovery steps with no option to bypass the check
        expect(screen.queryByText('common.youAppearToBeOffline')).toBeNull();
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'common.cantConnectSecurely',
                prompt: 'common.cantConnectSecurelyPrompt',
                shouldShowCancelButton: false,
            }),
        );
    });

    it('renders nothing while the app is online', () => {
        // Given a stale blocked flag while requests are going through, which happens in monitor mode or right after recovery
        mockState({isOffline: false, isBlocked: true});

        // When the indicator renders
        render(<OfflineIndicator />);

        // Then nothing is shown, because a connection that works is never reported as blocked
        expect(screen.queryByText('common.cantConnectSecurely', {exact: false})).toBeNull();
        expect(screen.queryByText('common.youAppearToBeOffline')).toBeNull();
    });
});
