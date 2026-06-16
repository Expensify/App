import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {dismissForSession} from '@libs/actions/ConciergeNotificationBanner';
import type {NotificationPermissionStatus} from '@libs/Notification/notificationPermission/types';
import EnableNotificationsBanner from '@pages/inbox/report/EnableNotificationsBanner';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockRequestResult: NotificationPermissionStatus = 'default';
const mockRequest = jest.fn(() => Promise.resolve(mockRequestResult));

jest.mock('@libs/Notification/notificationPermission', () => ({
    __esModule: true,
    default: {
        getStatus: () => Promise.resolve('default' as NotificationPermissionStatus),
        request: () => mockRequest(),
    },
}));

jest.mock('@libs/actions/ConciergeNotificationBanner', () => ({
    dismissForSession: jest.fn(),
}));

function renderBanner() {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <EnableNotificationsBanner />
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
}

describe('EnableNotificationsBanner', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockRequestResult = 'default';
        await Onyx.clear();
    });

    it('renders the prompt text and both action buttons', async () => {
        renderBanner();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('Want to be notified when Concierge responds?')).toBeOnTheScreen();
        expect(screen.getByText('Notify')).toBeOnTheScreen();
        expect(screen.getByText('Not now')).toBeOnTheScreen();
    });

    it('calls dismissForSession when "Not now" is pressed', async () => {
        renderBanner();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Not now'));
        expect(dismissForSession).toHaveBeenCalledTimes(1);
    });

    it('requests permission when "Notify" is pressed and dismisses on grant', async () => {
        mockRequestResult = 'granted';
        renderBanner();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Notify'));
        await waitForBatchedUpdatesWithAct();
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(dismissForSession).toHaveBeenCalledTimes(1);
    });

    it('dismisses after request even when permission is denied so the banner does not get stuck', async () => {
        mockRequestResult = 'denied';
        renderBanner();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Notify'));
        await waitForBatchedUpdatesWithAct();
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(dismissForSession).toHaveBeenCalledTimes(1);
    });
});
