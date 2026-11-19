import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import type BaseModalProps from '@components/Modal/types';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import Growl from '@libs/Growl';
import * as NetworkState from '@libs/NetworkState';

import DeviceManagementPage from '@pages/settings/Security/DeviceManagementPage';

import redirectToSignIn from '@userActions/SignInRedirect';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import type {View as NativeView} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/API');
jest.mock('@userActions/SignInRedirect');
jest.mock('@hooks/useResponsiveLayout');
jest.mock('@components/RenderHTML', () => {
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children: React.ReactNode}>}>('react-native');
    return {__esModule: true, default: ({html}: {html: string}) => <Text>{html}</Text>};
});
jest.mock('@components/ScreenWrapper', () => {
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    return {__esModule: true, default: ({children}: {children: React.ReactNode}) => <View>{children}</View>};
});
jest.mock('@components/Modal', () => {
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    const {useEffect} = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        default: function MockModal({children, isVisible, onModalHide}: BaseModalProps) {
            useEffect(() => {
                if (isVisible) {
                    return;
                }
                onModalHide?.();
            }, [isVisible, onModalHide]);
            return isVisible ? <View testID="confirmation">{children}</View> : null;
        },
    };
});

const SIGN_OUT_TEXT = 'Sign out on all devices';
const CONFIRMATION_TEXT = 'You’ll be signed out on all devices, including this one. You’ll need to sign in again to use Expensify.';
const ERROR_TEXT = 'We couldn’t sign you out on all devices. Please try again.';
const mockAPI = jest.mocked(API);

function renderPage() {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, ModalProvider]}>
            <DeviceManagementPage />
        </ComposeProviders>,
    );
}

async function openConfirmation() {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT}));
    await waitForBatchedUpdatesWithAct();
}

describe('Device management sign out on all devices', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.spyOn(Growl, 'success').mockImplementation(() => {});
        NetworkState.setHasRadio(true);
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.LOGINS, {
            device: {
                accountID: 1,
                partnerID: CONST.PARTNER_ID.NEWDOT,
                partnerUserID: 'device',
                created: '2026-11-01 12:00:00',
                lastLogin: '2026-11-01 12:00:00',
                validatedDate: null,
                additionalData: {
                    deviceName: 'Chrome',
                    os: 'macOS',
                    osVersion: '15',
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- Device metadata uses the server's field name.
                    app_version: '1',
                    timestamp: '2026-11-01 12:00:00',
                },
            },
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        NetworkState.setHasRadio(true);
    });

    it.each([1, 30])('keeps sign out available outside the scrolling device rows with %i devices', async (deviceCount) => {
        // Given an account whose device list may be taller than the available screen
        const device = (await Onyx.get(ONYXKEYS.LOGINS))?.device;
        if (!device) {
            throw new Error('Expected a device login in the test account');
        }
        await Onyx.set(ONYXKEYS.LOGINS, Object.fromEntries(Array.from({length: deviceCount}, (_, index) => [`device${index}`, {...device, partnerUserID: `device${index}`}])));
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When the device list is scrolled
        const deviceList = screen.getByTestId('DeviceManagementList');
        fireEvent.scroll(deviceList, {
            nativeEvent: {
                contentOffset: {x: 0, y: 1200},
                contentSize: {width: 300, height: 2400},
                layoutMeasurement: {width: 300, height: 400},
            },
        });
        await waitForBatchedUpdatesWithAct();

        // Then the bulk action stays available independently of the scrolling rows, whose revoke controls remain intact
        expect(within(deviceList).queryByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT})).not.toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT})).toBeOnTheScreen();
        expect(within(deviceList).getAllByRole(CONST.ROLE.BUTTON, {name: 'Revoke'}).length).toBeGreaterThan(0);
    });

    it('explains that this device is included and cancels without submitting', async () => {
        // Given the user has opened device management
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // When they open the confirmation and cancel
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));
        expect(confirmation.getByText(CONFIRMATION_TEXT)).toBeOnTheScreen();
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: 'Cancel'}));
        await waitForBatchedUpdatesWithAct();

        // Then they remain on device management without a request or success message
        expect(screen.queryByTestId('confirmation')).not.toBeOnTheScreen();
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT})).toBeOnTheScreen();
        expect(mockAPI.makeRequestWithSideEffects).not.toHaveBeenCalled();
        expect(redirectToSignIn).not.toHaveBeenCalled();
        expect(Growl.success).not.toHaveBeenCalled();
    });

    it('shows the existing offline dialog instead of accepting an offline sign-out', async () => {
        // Given device management was opened before connectivity was lost
        renderPage();
        await waitForBatchedUpdatesWithAct();
        act(() => NetworkState.setHasRadio(false));

        // When the user tries to sign out on all devices
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));

        // Then only the informational offline dialog is offered, and reconnecting submits nothing
        expect(confirmation.getByText('You appear to be offline.')).toBeOnTheScreen();
        expect(confirmation.queryByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT})).not.toBeOnTheScreen();
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: 'Got it'}));
        act(() => NetworkState.setHasRadio(true));
        await waitForBatchedUpdatesWithAct();
        expect(mockAPI.makeRequestWithSideEffects).not.toHaveBeenCalled();
        expect(mockAPI.write).not.toHaveBeenCalled();
        expect(Growl.success).not.toHaveBeenCalled();
    });

    it('disables confirmation on disconnect and never submits after cancellation and reconnect', async () => {
        // Given the confirmation was opened while online
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));

        // When connectivity is lost while it is open
        act(() => NetworkState.setHasRadio(false));
        await waitForBatchedUpdatesWithAct();

        // Then offline feedback explains the disabled action, and cancellation stays cancelled after reconnect
        expect(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT})).toBeDisabled();
        expect(confirmation.getByText('You appear to be offline.')).toBeOnTheScreen();
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT}));
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: 'Cancel'}));
        await waitForBatchedUpdatesWithAct();
        act(() => NetworkState.setHasRadio(true));
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByTestId('confirmation')).not.toBeOnTheScreen();
        expect(mockAPI.makeRequestWithSideEffects).not.toHaveBeenCalled();
        expect(mockAPI.write).not.toHaveBeenCalled();
        expect(Growl.success).not.toHaveBeenCalled();
    });

    it('announces pending submissions as busy, prevents duplicates, and clears busy after failure before retrying', async () => {
        // Given the server holds the first request before reporting a failure
        const response = Promise.withResolvers<{jsonCode: number}>();
        mockAPI.makeRequestWithSideEffects.mockReturnValueOnce(response.promise);
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));
        const confirmButton = confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT});

        // When the user confirms repeatedly before the response arrives
        // eslint-disable-next-line testing-library/no-unnecessary-act -- Both presses must share a React batch to exercise the guard before the loading state renders.
        act(() => {
            fireEvent.press(confirmButton);
            fireEvent.press(confirmButton);
        });
        await waitForBatchedUpdatesWithAct();

        // Then one request is sent, and failure keeps the confirmation available for retry or cancel
        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledTimes(1);
        expect(confirmButton).toBeDisabled();
        expect(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT, busy: true})).toBeDisabled();
        await act(async () => response.resolve({jsonCode: 500}));
        await waitForBatchedUpdatesWithAct();
        expect(confirmation.getByText(ERROR_TEXT)).toBeOnTheScreen();
        expect(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT, busy: false})).toBeEnabled();
        expect(confirmation.getByRole(CONST.ROLE.BUTTON, {name: 'Cancel'})).toBeEnabled();
        expect(redirectToSignIn).not.toHaveBeenCalled();
        expect(Growl.success).not.toHaveBeenCalled();

        // When retry succeeds
        const retryResponse = Promise.withResolvers<{jsonCode: number}>();
        mockAPI.makeRequestWithSideEffects.mockReturnValueOnce(retryResponse.promise);
        jest.mocked(redirectToSignIn).mockResolvedValueOnce();
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT}));
        await waitForBatchedUpdatesWithAct();
        expect(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT, busy: true})).toBeDisabled();
        await act(async () => retryResponse.resolve({jsonCode: CONST.JSON_CODE.SUCCESS}));
        await waitForBatchedUpdatesWithAct();

        // Then sign-out succeeds without requiring the user to reopen the confirmation
        expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledTimes(2);
        expect(redirectToSignIn).toHaveBeenCalledTimes(1);
        expect(Growl.success).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('confirmation')).not.toBeOnTheScreen();
    });

    it('lets the user cancel after a failed sign-out without clearing their session', async () => {
        // Given the server cannot revoke sessions
        mockAPI.makeRequestWithSideEffects.mockResolvedValueOnce({jsonCode: 500});
        renderPage();
        await waitForBatchedUpdatesWithAct();
        await openConfirmation();
        const confirmation = within(screen.getByTestId('confirmation'));

        // When the user submits and then cancels the failed confirmation
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: SIGN_OUT_TEXT}));
        await waitForBatchedUpdatesWithAct();
        expect(confirmation.getByText(ERROR_TEXT)).toBeOnTheScreen();
        fireEvent.press(confirmation.getByRole(CONST.ROLE.BUTTON, {name: 'Cancel'}));
        await waitForBatchedUpdatesWithAct();

        // Then they remain signed in and can still use device management
        expect(screen.queryByTestId('confirmation')).not.toBeOnTheScreen();
        expect(screen.getByText('Chrome (macOS 15)')).toBeOnTheScreen();
        expect(redirectToSignIn).not.toHaveBeenCalled();
        expect(Growl.success).not.toHaveBeenCalled();
    });
});
