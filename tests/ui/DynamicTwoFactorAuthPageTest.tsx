import {act, render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import DynamicTwoFactorAuthPage from '@pages/settings/Security/TwoFactorAuth/DynamicTwoFactorAuthPage';

import {toggleTwoFactorAuth} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type * as ReactNavigationNative from '@react-navigation/native';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn(),
    })),
);

jest.mock('@components/RenderHTML', () => jest.fn(() => null));

jest.mock('@hooks/useThemeStyles', () => {
    // Some style entries, such as twoFactorAuthCodesBoxPadding, are functions of layout flags.
    const styleProxy: () => unknown = new Proxy(() => styleProxy, {
        get: () => styleProxy,
    });
    return jest.fn(() => styleProxy);
});

jest.mock('@userActions/Session', () => ({
    toggleTwoFactorAuth: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

// The wrapper only adds the screen chrome, which needs a navigator to render.
jest.mock('@pages/settings/Security/TwoFactorAuth/TwoFactorAuthWrapper', () => ({
    __esModule: true,
    default: ({children}: ChildrenProps) => children,
}));

const mockToggleTwoFactorAuth = jest.mocked(toggleTwoFactorAuth);
const mockUseIsFocused = jest.mocked(useIsFocused);

const RECOVERY_CODES = '111111111, 222222222';

const renderPage = () =>
    render(
        <OnyxListItemProvider>
            <DynamicTwoFactorAuthPage />
        </OnyxListItemProvider>,
    );

describe('DynamicTwoFactorAuthPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(true);
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('does not call Toggle again when an unfinished setup already has recovery codes', async () => {
        // Given the user already started setup and scanned the QR code
        await Onyx.merge(ONYXKEYS.ACCOUNT, {
            validated: true,
            requiresTwoFactorAuth: false,
            recoveryCodes: RECOVERY_CODES,
            twoFactorAuthSecretKey: 'ABCDEFGHIJKLMNOP',
        });
        await waitForBatchedUpdatesWithAct();

        // When they reopen the codes page
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the existing codes are reused and EnableTwoFactorAuth is not called
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
    });

    it('calls Toggle once for a fresh setup', async () => {
        // Given a validated account with no setup in progress
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false});
        await waitForBatchedUpdatesWithAct();

        // When the codes page opens
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then EnableTwoFactorAuth is requested exactly once
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledTimes(1);
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledWith(true);
    });

    it('does not call Toggle again when focus flickers before the response arrives', async () => {
        // Given a fresh setup whose EnableTwoFactorAuth request has not returned codes yet
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false});
        await waitForBatchedUpdatesWithAct();
        const {rerender} = renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledTimes(1);

        // When the page loses and regains focus
        mockUseIsFocused.mockReturnValue(false);
        rerender(
            <OnyxListItemProvider>
                <DynamicTwoFactorAuthPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        mockUseIsFocused.mockReturnValue(true);
        rerender(
            <OnyxListItemProvider>
                <DynamicTwoFactorAuthPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then a second EnableTwoFactorAuth request is not sent
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledTimes(1);
    });

    it('retries Toggle after a failed request once the page is focused again', async () => {
        // Given a fresh setup whose first EnableTwoFactorAuth request has not returned codes
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false});
        await waitForBatchedUpdatesWithAct();
        const {rerender} = renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledTimes(1);

        // When that request fails, then the page loses and regains focus
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
        });
        await waitForBatchedUpdatesWithAct();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false});
        });
        await waitForBatchedUpdatesWithAct();

        mockUseIsFocused.mockReturnValue(false);
        rerender(
            <OnyxListItemProvider>
                <DynamicTwoFactorAuthPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        mockUseIsFocused.mockReturnValue(true);
        rerender(
            <OnyxListItemProvider>
                <DynamicTwoFactorAuthPage />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the failed request is retried, because the guard resets once loading ends without codes
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledTimes(2);
    });
});
