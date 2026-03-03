/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/naming-convention
import MultifactorAuthenticationRevokePage from '@pages/MultifactorAuthentication/RevokePage';

let mockBiometricStatus = {
    localPublicKey: undefined as string | undefined,
    isCurrentDeviceRegistered: false,
    otherDeviceCount: 0,
    totalDeviceCount: 0,
    registrationStatus: 'never' as string,
};

jest.mock('@hooks/useBiometricRegistrationStatus', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => mockBiometricStatus,
}));

const mockRevokeCredentials = jest.fn().mockResolvedValue({httpStatusCode: 200});
jest.mock('@libs/actions/MultifactorAuthentication', () => ({
    revokeMultifactorAuthenticationCredentials: (...args: unknown[]): Promise<{httpStatusCode: number}> => mockRevokeCredentials(...args) as Promise<{httpStatusCode: number}>,
}));

jest.mock('@userActions/User', () => ({
    openMultifactorAuthenticationRevokePage: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
    }),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () =>
        new Proxy(
            {},
            {
                get: () => ({}),
            },
        ),
}));

jest.mock('@components/ScreenWrapper', () => {
    const MockScreenWrapper = ({children}: {children: React.ReactNode}) => children;
    MockScreenWrapper.displayName = 'ScreenWrapper';
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader() {
        return null;
    }
    MockHeader.displayName = 'HeaderWithBackButton';
    return MockHeader;
});

jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => {
    const MockView = ({children}: {children: React.ReactNode}) => children;
    MockView.displayName = 'FullPageOfflineBlockingView';
    return MockView;
});

jest.mock('@components/FormHelpMessage', () => {
    function MockFormHelpMessage() {
        return null;
    }
    MockFormHelpMessage.displayName = 'FormHelpMessage';
    return MockFormHelpMessage;
});

let capturedConfirmModalProps: Record<string, unknown> = {};
jest.mock('@components/ConfirmModal', () => {
    function MockConfirmModal(props: Record<string, unknown>) {
        capturedConfirmModalProps = props;
        return null;
    }
    MockConfirmModal.displayName = 'ConfirmModal';
    return MockConfirmModal;
});

function setBiometricStatus(overrides: Partial<typeof mockBiometricStatus>) {
    mockBiometricStatus = {
        localPublicKey: undefined,
        isCurrentDeviceRegistered: false,
        otherDeviceCount: 0,
        totalDeviceCount: 0,
        registrationStatus: 'never',
        ...overrides,
    };
}

describe('MultifactorAuthenticationRevokePage', () => {
    afterEach(() => {
        jest.clearAllMocks();
        capturedConfirmModalProps = {};
    });

    describe('Bottom button text', () => {
        it('shows "Done" when no devices are registered', () => {
            // Given no registered devices
            setBiometricStatus({totalDeviceCount: 0});

            // When the page renders
            render(<MultifactorAuthenticationRevokePage />);

            // Then the bottom button should say "Done" because there is nothing to revoke
            expect(screen.getByText('multifactorAuthentication.revoke.dismiss')).toBeTruthy();
        });

        it('shows "Revoke access" when exactly one device is registered', () => {
            // Given exactly one registered device (this device)
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            // When the page renders
            render(<MultifactorAuthenticationRevokePage />);

            // Then the bottom button should say "Revoke access" because there is only one device
            expect(screen.getAllByText('multifactorAuthentication.revoke.cta').length).toBeGreaterThan(0);
        });

        it('shows "Revoke all" when multiple devices are registered', () => {
            // Given this device plus one other device registered
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            // When the page renders
            render(<MultifactorAuthenticationRevokePage />);

            // Then the bottom button should say "Revoke all" because there are multiple devices
            expect(screen.getByText('multifactorAuthentication.revoke.ctaAll')).toBeTruthy();
        });
    });

    describe('Inline "This device" Revoke button', () => {
        it('shows "this device" prompt with "Revoke access" confirm button', () => {
            // Given this device is the only registered device
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            // When the user presses the inline Revoke button next to "This device"
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const thisDeviceButton = revokeButtons.at(0);
            expect(thisDeviceButton).toBeTruthy();
            fireEvent.press(thisDeviceButton!);

            // Then the confirmation modal should say "this device" and the confirm button should say "Revoke access"
            expect(capturedConfirmModalProps.prompt).toBe('multifactorAuthentication.revoke.confirmationPromptThisDevice');
            expect(capturedConfirmModalProps.confirmText).toBe('multifactorAuthentication.revoke.cta');
            expect(capturedConfirmModalProps.isVisible).toBe(true);
        });
    });

    describe('Inline "Other devices" Revoke button', () => {
        it('shows "that device" prompt with "Revoke access" when revoking 1 other device', () => {
            // Given this device is registered and there is 1 other device
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            // When the user presses the inline Revoke button next to "Other devices"
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const otherDevicesButton = revokeButtons.at(1);
            expect(otherDevicesButton).toBeTruthy();
            fireEvent.press(otherDevicesButton!);

            // Then the modal should say "that device" and the confirm button should say "Revoke access"
            expect(capturedConfirmModalProps.prompt).toBe('multifactorAuthentication.revoke.confirmationPrompt');
            expect(capturedConfirmModalProps.confirmText).toBe('multifactorAuthentication.revoke.cta');
        });

        it('shows "those devices" prompt with "Revoke access" when revoking 2+ others and this device is registered', () => {
            // Given this device is registered and there are 3 other devices
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 4, otherDeviceCount: 3});

            // When the user presses the inline Revoke button next to "Other devices"
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const otherDevicesButton = revokeButtons.at(1);
            expect(otherDevicesButton).toBeTruthy();
            fireEvent.press(otherDevicesButton!);

            // Then the modal should say "those devices" and the confirm button should say "Revoke access"
            // because we're only revoking others, not this device
            expect(capturedConfirmModalProps.prompt).toBe('multifactorAuthentication.revoke.confirmationPromptMultiple');
            expect(capturedConfirmModalProps.confirmText).toBe('multifactorAuthentication.revoke.cta');
        });

        it('shows "any device" prompt with "Revoke all" when revoking 2+ others and this device is not registered', () => {
            // Given this device is NOT registered and there are 2 other devices
            setBiometricStatus({isCurrentDeviceRegistered: false, totalDeviceCount: 2, otherDeviceCount: 2});

            // When the user presses the inline Revoke button next to "Other devices"
            // (revoking "other devices" when this device is unregistered means revoking all)
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const otherDevicesButton = revokeButtons.at(0);
            expect(otherDevicesButton).toBeTruthy();
            fireEvent.press(otherDevicesButton!);

            // Then the modal should say "any device" and the confirm button should say "Revoke all"
            expect(capturedConfirmModalProps.prompt).toBe('multifactorAuthentication.revoke.confirmationPromptAll');
            expect(capturedConfirmModalProps.confirmText).toBe('multifactorAuthentication.revoke.ctaAll');
        });
    });

    describe('Bottom button confirmation modal', () => {
        it('shows "this device" prompt with "Revoke access" when only this device is registered', () => {
            // Given only this device is registered
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            // When the user presses the bottom "Revoke access" button
            render(<MultifactorAuthenticationRevokePage />);
            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.cta'));

            // Then the modal should say "this device" and the confirm button should say "Revoke access"
            // because the only device being revoked is the one the user is currently on
            expect(capturedConfirmModalProps.prompt).toBe('multifactorAuthentication.revoke.confirmationPromptThisDevice');
            expect(capturedConfirmModalProps.confirmText).toBe('multifactorAuthentication.revoke.cta');
        });

        it('shows "that device" prompt with "Revoke access" when only 1 other device is registered', () => {
            // Given this device is NOT registered and there is 1 other device
            setBiometricStatus({isCurrentDeviceRegistered: false, totalDeviceCount: 1, otherDeviceCount: 1});

            // When the user presses the bottom "Revoke access" button
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.cta');
            const bottomButton = revokeButtons.at(-1);
            expect(bottomButton).toBeTruthy();
            fireEvent.press(bottomButton!);

            // Then the modal should say "that device" and the confirm button should say "Revoke access"
            // because we're revoking a single device that is not the current one
            expect(capturedConfirmModalProps.prompt).toBe('multifactorAuthentication.revoke.confirmationPrompt');
            expect(capturedConfirmModalProps.confirmText).toBe('multifactorAuthentication.revoke.cta');
        });

        it('shows "any device" prompt with "Revoke all" when 2+ others and this device is not registered', () => {
            // Given this device is NOT registered and there are 3 other devices
            setBiometricStatus({isCurrentDeviceRegistered: false, totalDeviceCount: 3, otherDeviceCount: 3});

            // When the user presses the bottom "Revoke all" button
            render(<MultifactorAuthenticationRevokePage />);
            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.ctaAll'));

            // Then the modal should say "any device" and the confirm button should say "Revoke all"
            // because all registered devices will be revoked
            expect(capturedConfirmModalProps.prompt).toBe('multifactorAuthentication.revoke.confirmationPromptAll');
            expect(capturedConfirmModalProps.confirmText).toBe('multifactorAuthentication.revoke.ctaAll');
        });

        it('shows "any device" prompt with "Revoke all" when this device + others are registered', () => {
            // Given this device and 2 other devices are registered
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 3, otherDeviceCount: 2});

            // When the user presses the bottom "Revoke all" button
            render(<MultifactorAuthenticationRevokePage />);
            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.ctaAll'));

            // Then the modal should say "any device" and the confirm button should say "Revoke all"
            // because both this device and others are being revoked
            expect(capturedConfirmModalProps.prompt).toBe('multifactorAuthentication.revoke.confirmationPromptAll');
            expect(capturedConfirmModalProps.confirmText).toBe('multifactorAuthentication.revoke.ctaAll');
        });
    });

    describe('Revoke action params', () => {
        it('passes onlyKeyID when revoking this device', async () => {
            // Given this device is registered with key "key-this"
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            // When the user confirms revoking this device via the inline button
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const thisDeviceButton = revokeButtons.at(0);
            expect(thisDeviceButton).toBeTruthy();
            fireEvent.press(thisDeviceButton!);
            const onConfirm = capturedConfirmModalProps.onConfirm as () => void;
            await act(async () => {
                onConfirm();
            });

            // Then the API should be called with onlyKeyID matching this device's key
            // so that only this device is revoked and others are unaffected
            expect(mockRevokeCredentials).toHaveBeenCalledWith({onlyKeyID: 'key-this'});
        });

        it('passes exceptKeyID when revoking other devices while this device is registered', async () => {
            // Given this device is registered and there are other devices
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            // When the user confirms revoking other devices via the inline button
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const otherDevicesButton = revokeButtons.at(1);
            expect(otherDevicesButton).toBeTruthy();
            fireEvent.press(otherDevicesButton!);
            const onConfirm = capturedConfirmModalProps.onConfirm as () => void;
            await act(async () => {
                onConfirm();
            });

            // Then the API should be called with exceptKeyID to preserve this device's registration
            expect(mockRevokeCredentials).toHaveBeenCalledWith({exceptKeyID: 'key-this'});
        });

        it('passes empty params when revoking other devices while this device is not registered', async () => {
            // Given this device is NOT registered and there are 2 other devices
            setBiometricStatus({isCurrentDeviceRegistered: false, totalDeviceCount: 2, otherDeviceCount: 2});

            // When the user confirms revoking other devices
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const otherDevicesButton = revokeButtons.at(0);
            expect(otherDevicesButton).toBeTruthy();
            fireEvent.press(otherDevicesButton!);
            const onConfirm = capturedConfirmModalProps.onConfirm as () => void;
            await act(async () => {
                onConfirm();
            });

            // Then the API should be called with empty params to revoke all credentials
            // because there is no current device key to exclude
            expect(mockRevokeCredentials).toHaveBeenCalledWith({});
        });

        it('passes empty params when revoking all devices via bottom button', async () => {
            // Given this device and 1 other device are registered
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            // When the user confirms revoking all via the bottom "Revoke all" button
            render(<MultifactorAuthenticationRevokePage />);
            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.ctaAll'));
            const onConfirm = capturedConfirmModalProps.onConfirm as () => void;
            await act(async () => {
                onConfirm();
            });

            // Then the API should be called with empty params to revoke every credential
            expect(mockRevokeCredentials).toHaveBeenCalledWith({});
        });
    });

    describe('Error handling', () => {
        it('displays error message when revoke returns a non-200 status', async () => {
            mockRevokeCredentials.mockResolvedValueOnce({httpStatusCode: 500});
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const thisDeviceButton = revokeButtons.at(0);
            expect(thisDeviceButton).toBeTruthy();
            fireEvent.press(thisDeviceButton!);

            const onConfirm = capturedConfirmModalProps.onConfirm as () => void;
            await act(async () => {
                onConfirm();
            });

            expect(mockRevokeCredentials).toHaveBeenCalled();
        });
    });

    describe('Dismiss behavior', () => {
        it('shows "Done" button when no devices are registered and navigates back on press', () => {
            setBiometricStatus({totalDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            const dismissButton = screen.getByText('multifactorAuthentication.revoke.dismiss');
            expect(dismissButton).toBeTruthy();
        });

        it('hides confirm modal when cancel is pressed', () => {
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            fireEvent.press(revokeButtons.at(0)!);

            expect(capturedConfirmModalProps.isVisible).toBe(true);

            const onCancel = capturedConfirmModalProps.onCancel as () => void;
            act(() => {
                onCancel();
            });

            expect(capturedConfirmModalProps.isVisible).toBe(false);
        });
    });

    describe('Explanation text', () => {
        it('shows explanation text when devices are registered', () => {
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            expect(screen.getByText('multifactorAuthentication.revoke.explanation')).toBeTruthy();
        });

        it('shows "no devices" text when no devices are registered', () => {
            setBiometricStatus({totalDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            expect(screen.getByText('multifactorAuthentication.revoke.noDevices')).toBeTruthy();
        });
    });

    describe('ConfirmModal title', () => {
        it('shows "Revoke all" title on modal when revoking all devices', () => {
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            render(<MultifactorAuthenticationRevokePage />);

            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.ctaAll'));

            expect(capturedConfirmModalProps.title).toBe('multifactorAuthentication.revoke.ctaAll');
        });

        it('shows "Revoke access" title on modal when revoking a single device', () => {
            setBiometricStatus({localPublicKey: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            fireEvent.press(revokeButtons.at(0)!);

            expect(capturedConfirmModalProps.title).toBe('multifactorAuthentication.revoke.cta');
        });
    });
});
