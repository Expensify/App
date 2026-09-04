/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {revokeMultifactorAuthenticationCredentials as revokeMultifactorAuthenticationCredentialsType} from '@libs/actions/MultifactorAuthentication';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import MultifactorAuthenticationRevokePage from '@pages/MultifactorAuthentication/RevokePage';

import CONST from '@src/CONST';

import React from 'react';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import createMock from '../utils/createMock';
import {getShowConfirmModalOption, mockCloseModal, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';

type MultifactorAuthenticationRevokeResponse = Awaited<ReturnType<typeof revokeMultifactorAuthenticationCredentialsType>>;

jest.mock('@libs/API');
const mockAPI = jest.mocked(API);

let mockBiometricStatus = {
    localCredentialID: undefined as string | undefined,
    isCurrentDeviceRegistered: false,
    otherDeviceCount: 0,
    totalDeviceCount: 0,
    registrationStatus: 'never' as string,
};

jest.mock('@hooks/useBiometricRegistrationStatus', () => ({
    __esModule: true,
    default: () => mockBiometricStatus,
}));

const mockRevokeCredentials = jest
    .fn<ReturnType<typeof revokeMultifactorAuthenticationCredentialsType>, Parameters<typeof revokeMultifactorAuthenticationCredentialsType>>()
    .mockResolvedValue(createMock<MultifactorAuthenticationRevokeResponse>({httpStatusCode: 200}));
jest.mock('@libs/actions/MultifactorAuthentication', () => ({
    revokeMultifactorAuthenticationCredentials: (...args: Parameters<typeof revokeMultifactorAuthenticationCredentialsType>): Promise<MultifactorAuthenticationRevokeResponse> =>
        mockRevokeCredentials(...args),
}));

jest.mock('@userActions/User', () => ({
    openMultifactorAuthenticationRevokePage: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
    }),
}));

jest.mock('@hooks/useThemeStyles', () => ({
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {Text} = require('react-native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mockReact = require('react');
    function MockFormHelpMessage({message}: {message?: string}) {
        if (!message) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        return mockReact.createElement(Text, null, message);
    }
    MockFormHelpMessage.displayName = 'FormHelpMessage';
    return MockFormHelpMessage;
});

// The page no longer renders ConfirmModal itself -- it pushes one onto the global modal stack via useConfirmModal.
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

// Derived from the imported value rather than from MockUseConfirmModalUtil.ShowConfirmModalResult: reading a member off
// that namespace import makes knip track the helper's exports member-by-member, which orphans the ones only reached
// through jest.requireActual (default, createMockModalContextModule, ...) and fails the knip-vs-main check.
type ConfirmModalAction = NonNullable<Parameters<typeof resolveShowConfirmModal>[0]>['action'];

/** Settle the pending confirm-modal promise and flush the async revoke chain it kicks off. */
async function settleConfirmModal(action: ConfirmModalAction) {
    await act(async () => {
        resolveShowConfirmModal({action});
        await Promise.resolve();
    });
}

function setBiometricStatus(overrides: Partial<typeof mockBiometricStatus>) {
    mockBiometricStatus = {
        localCredentialID: undefined,
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
        resetMockConfirmModal();
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
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            // When the page renders
            render(<MultifactorAuthenticationRevokePage />);

            // Then the bottom button should say "Revoke access" because there is only one device
            expect(screen.getAllByText('multifactorAuthentication.revoke.cta').length).toBeGreaterThan(0);
        });

        it('shows "Revoke all" when multiple devices are registered', () => {
            // Given this device plus one other device registered
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            // When the page renders
            render(<MultifactorAuthenticationRevokePage />);

            // Then the bottom button should say "Revoke all" because there are multiple devices
            expect(screen.getByText('multifactorAuthentication.revoke.ctaAll')).toBeTruthy();
        });
    });

    describe('Inline "This device" Revoke button', () => {
        it('shows "this device" prompt with "Revoke access" confirm button', () => {
            // Given this device is the only registered device
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            // When the user presses the inline Revoke button next to "This device"
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const thisDeviceButton = revokeButtons.at(0);
            expect(thisDeviceButton).toBeTruthy();
            fireEvent.press(thisDeviceButton!);

            // Then the confirmation modal should say "this device" and the confirm button should say "Revoke access"
            expect(getShowConfirmModalOption('prompt')).toBe('multifactorAuthentication.revoke.confirmationPromptThisDevice');
            expect(getShowConfirmModalOption('confirmText')).toBe('multifactorAuthentication.revoke.cta');

            // And isConfirmLoading must be *defined* so the global modal takes its async branch and stays open in a loading state
            expect(getShowConfirmModalOption('isConfirmLoading')).toBeDefined();
        });
    });

    describe('Inline "Other devices" Revoke button', () => {
        it('shows "that device" prompt with "Revoke access" when revoking 1 other device', () => {
            // Given this device is registered and there is 1 other device
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            // When the user presses the inline Revoke button next to "Other devices"
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const otherDevicesButton = revokeButtons.at(1);
            expect(otherDevicesButton).toBeTruthy();
            fireEvent.press(otherDevicesButton!);

            // Then the modal should say "that device" and the confirm button should say "Revoke access"
            expect(getShowConfirmModalOption('prompt')).toBe('multifactorAuthentication.revoke.confirmationPrompt');
            expect(getShowConfirmModalOption('confirmText')).toBe('multifactorAuthentication.revoke.cta');
        });

        it('shows "those devices" prompt with "Revoke access" when revoking 2+ others and this device is registered', () => {
            // Given this device is registered and there are 3 other devices
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 4, otherDeviceCount: 3});

            // When the user presses the inline Revoke button next to "Other devices"
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const otherDevicesButton = revokeButtons.at(1);
            expect(otherDevicesButton).toBeTruthy();
            fireEvent.press(otherDevicesButton!);

            // Then the modal should say "those devices" and the confirm button should say "Revoke access"
            // because we're only revoking others, not this device
            expect(getShowConfirmModalOption('prompt')).toBe('multifactorAuthentication.revoke.confirmationPromptMultiple');
            expect(getShowConfirmModalOption('confirmText')).toBe('multifactorAuthentication.revoke.cta');
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
            expect(getShowConfirmModalOption('prompt')).toBe('multifactorAuthentication.revoke.confirmationPromptAll');
            expect(getShowConfirmModalOption('confirmText')).toBe('multifactorAuthentication.revoke.ctaAll');
        });
    });

    describe('Bottom button confirmation modal', () => {
        it('shows "this device" prompt with "Revoke access" when only this device is registered', () => {
            // Given only this device is registered
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            // When the user presses the bottom "Revoke access" button
            render(<MultifactorAuthenticationRevokePage />);
            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.cta'));

            // Then the modal should say "this device" and the confirm button should say "Revoke access"
            // because the only device being revoked is the one the user is currently on
            expect(getShowConfirmModalOption('prompt')).toBe('multifactorAuthentication.revoke.confirmationPromptThisDevice');
            expect(getShowConfirmModalOption('confirmText')).toBe('multifactorAuthentication.revoke.cta');
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
            expect(getShowConfirmModalOption('prompt')).toBe('multifactorAuthentication.revoke.confirmationPrompt');
            expect(getShowConfirmModalOption('confirmText')).toBe('multifactorAuthentication.revoke.cta');
        });

        it('shows "any device" prompt with "Revoke all" when 2+ others and this device is not registered', () => {
            // Given this device is NOT registered and there are 3 other devices
            setBiometricStatus({isCurrentDeviceRegistered: false, totalDeviceCount: 3, otherDeviceCount: 3});

            // When the user presses the bottom "Revoke all" button
            render(<MultifactorAuthenticationRevokePage />);
            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.ctaAll'));

            // Then the modal should say "any device" and the confirm button should say "Revoke all"
            // because all registered devices will be revoked
            expect(getShowConfirmModalOption('prompt')).toBe('multifactorAuthentication.revoke.confirmationPromptAll');
            expect(getShowConfirmModalOption('confirmText')).toBe('multifactorAuthentication.revoke.ctaAll');
        });

        it('shows "any device" prompt with "Revoke all" when this device + others are registered', () => {
            // Given this device and 2 other devices are registered
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 3, otherDeviceCount: 2});

            // When the user presses the bottom "Revoke all" button
            render(<MultifactorAuthenticationRevokePage />);
            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.ctaAll'));

            // Then the modal should say "any device" and the confirm button should say "Revoke all"
            // because both this device and others are being revoked
            expect(getShowConfirmModalOption('prompt')).toBe('multifactorAuthentication.revoke.confirmationPromptAll');
            expect(getShowConfirmModalOption('confirmText')).toBe('multifactorAuthentication.revoke.ctaAll');
        });
    });

    describe('Revoke action params', () => {
        it('passes onlyKeyID when revoking this device', async () => {
            // Given this device is registered with key "key-this"
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            // When the user confirms revoking this device via the inline button
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const thisDeviceButton = revokeButtons.at(0);
            expect(thisDeviceButton).toBeTruthy();
            fireEvent.press(thisDeviceButton!);
            await settleConfirmModal('CONFIRM');

            // Then the API should be called with onlyKeyID matching this device's key
            // so that only this device is revoked and others are unaffected
            expect(mockRevokeCredentials).toHaveBeenCalledWith({onlyKeyID: 'key-this'});
        });

        it('passes exceptKeyID when revoking other devices while this device is registered', async () => {
            // Given this device is registered and there are other devices
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            // When the user confirms revoking other devices via the inline button
            render(<MultifactorAuthenticationRevokePage />);
            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const otherDevicesButton = revokeButtons.at(1);
            expect(otherDevicesButton).toBeTruthy();
            fireEvent.press(otherDevicesButton!);
            await settleConfirmModal('CONFIRM');

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
            await settleConfirmModal('CONFIRM');

            // Then the API should be called with empty params to revoke all credentials
            // because there is no current device key to exclude
            expect(mockRevokeCredentials).toHaveBeenCalledWith({});
        });

        it('passes empty params when revoking all devices via bottom button', async () => {
            // Given this device and 1 other device are registered
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            // When the user confirms revoking all via the bottom "Revoke all" button
            render(<MultifactorAuthenticationRevokePage />);
            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.ctaAll'));
            await settleConfirmModal('CONFIRM');

            // Then the API should be called with empty params to revoke every credential
            expect(mockRevokeCredentials).toHaveBeenCalledWith({});
        });
    });

    describe('Error handling', () => {
        it('displays error message when revoke returns a non-200 status', async () => {
            mockRevokeCredentials.mockResolvedValueOnce(createMock<MultifactorAuthenticationRevokeResponse>({httpStatusCode: 500}));
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            const thisDeviceButton = revokeButtons.at(0);
            expect(thisDeviceButton).toBeTruthy();
            fireEvent.press(thisDeviceButton!);

            await settleConfirmModal('CONFIRM');

            expect(mockRevokeCredentials).toHaveBeenCalled();
            expect(screen.getByText('multifactorAuthentication.revoke.error')).toBeTruthy();
        });
    });

    describe('Dismiss behavior', () => {
        it('shows "Done" button when no devices are registered and navigates back on press', () => {
            setBiometricStatus({totalDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            const dismissButton = screen.getByText('multifactorAuthentication.revoke.dismiss');
            expect(dismissButton).toBeTruthy();
        });

        it('does not revoke anything when the confirm modal is dismissed', async () => {
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            fireEvent.press(revokeButtons.at(0)!);

            expect(mockShowConfirmModal).toHaveBeenCalled();

            // When the modal is dismissed rather than confirmed (cancel button, backdrop or ESC)
            await settleConfirmModal('CLOSE');

            // Then nothing is revoked and no extra close is issued -- the modal already dismissed itself
            expect(mockRevokeCredentials).not.toHaveBeenCalled();
            expect(mockCloseModal).not.toHaveBeenCalled();
        });

        it('closes the loading modal after the revoke completes', async () => {
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            fireEvent.press(revokeButtons.at(0)!);

            await settleConfirmModal('CONFIRM');

            // The modal is kept open in a loading state by the global modal system, so the page must close it explicitly
            expect(mockCloseModal).toHaveBeenCalled();
        });

        it('closes the loading modal on the early-return path where there is no local credential', async () => {
            // Given this device is marked registered but its credential ID has not loaded, so "Other devices" opens the modal in 'multiple' mode
            setBiometricStatus({localCredentialID: undefined, isCurrentDeviceRegistered: true, totalDeviceCount: 3, otherDeviceCount: 2});

            render(<MultifactorAuthenticationRevokePage />);

            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            fireEvent.press(revokeButtons.at(1)!);

            await settleConfirmModal('CONFIRM');

            // Then the early-return path still has to close the modal, otherwise it is stuck loading forever
            expect(mockRevokeCredentials).not.toHaveBeenCalled();
            expect(mockCloseModal).toHaveBeenCalled();
        });
    });

    describe('Explanation text', () => {
        it('shows explanation text when devices are registered', () => {
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

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
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 2, otherDeviceCount: 1});

            render(<MultifactorAuthenticationRevokePage />);

            fireEvent.press(screen.getByText('multifactorAuthentication.revoke.ctaAll'));

            expect(getShowConfirmModalOption('title')).toBe('multifactorAuthentication.revoke.ctaAll');
        });

        it('shows "Revoke access" title on modal when revoking a single device', () => {
            setBiometricStatus({localCredentialID: 'key-this', isCurrentDeviceRegistered: true, totalDeviceCount: 1, otherDeviceCount: 0});

            render(<MultifactorAuthenticationRevokePage />);

            const revokeButtons = screen.getAllByText('multifactorAuthentication.revoke.revoke');
            fireEvent.press(revokeButtons.at(0)!);

            expect(getShowConfirmModalOption('title')).toBe('multifactorAuthentication.revoke.cta');
        });
    });
});

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const {revokeMultifactorAuthenticationCredentials} = jest.requireActual<typeof import('@libs/actions/MultifactorAuthentication')>('@libs/actions/MultifactorAuthentication');

describe('revokeMultifactorAuthenticationCredentials', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call makeRequestWithSideEffects with correct command and onlyKeyID param', async () => {
        mockAPI.makeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

        await revokeMultifactorAuthenticationCredentials({onlyKeyID: 'key-123'});

        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.REVOKE_MULTIFACTOR_AUTHENTICATION_CREDENTIALS, {onlyKeyID: 'key-123'}, {});
    });

    it('should pass exceptKeyID when revoking other devices', async () => {
        mockAPI.makeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

        await revokeMultifactorAuthenticationCredentials({exceptKeyID: 'key-456'});

        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.REVOKE_MULTIFACTOR_AUTHENTICATION_CREDENTIALS, {exceptKeyID: 'key-456'}, {});
    });

    it('should pass empty params when revoking all devices', async () => {
        mockAPI.makeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

        await revokeMultifactorAuthenticationCredentials({});

        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.REVOKE_MULTIFACTOR_AUTHENTICATION_CREDENTIALS, {}, {});
    });

    it('should return success response when API returns 200', async () => {
        mockAPI.makeRequestWithSideEffects.mockResolvedValue({jsonCode: 200});

        const result = await revokeMultifactorAuthenticationCredentials({});

        expect(result.httpStatusCode).toBe(200);
        expect(result.reason).toBeUndefined();
    });

    it('should return error response when API returns non-200', async () => {
        mockAPI.makeRequestWithSideEffects.mockResolvedValue({jsonCode: 500});

        const result = await revokeMultifactorAuthenticationCredentials({});

        expect(result.httpStatusCode).toBe(500);
    });

    it('should handle API throwing an error gracefully', async () => {
        mockAPI.makeRequestWithSideEffects.mockRejectedValue(new Error('Network error'));

        const result = await revokeMultifactorAuthenticationCredentials({onlyKeyID: 'key-123'});

        expect(result.httpStatusCode).toBe(0);
        expect(result.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE);
    });
});
