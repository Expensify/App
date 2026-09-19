import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import DynamicTwoFactorAuthPage from '@pages/settings/Security/TwoFactorAuth/DynamicTwoFactorAuthPage';

import {toggleTwoFactorAuth} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
    };
});

const mockCanGoBack = jest.fn<boolean, []>();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        isNavigationReady: jest.fn(() => Promise.resolve()),
    },
    navigationRef: {current: {canGoBack: () => mockCanGoBack()}},
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/security'));

jest.mock('@userActions/Session', () => ({
    toggleTwoFactorAuth: jest.fn(),
}));

jest.mock('@pages/settings/Security/TwoFactorAuth/TwoFactorAuthWrapper', () => {
    function MockTwoFactorAuthWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockTwoFactorAuthWrapper;
});

jest.mock('@components/RenderHTML', () => {
    function MockRenderHTML() {
        return null;
    }
    return MockRenderHTML;
});

const mockToggleTwoFactorAuth = jest.mocked(toggleTwoFactorAuth);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockGoBack = jest.mocked(Navigation.goBack);

const renderPage = async () => {
    render(
        <OnyxListItemProvider>
            <DynamicTwoFactorAuthPage />
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdates();
};

describe('DynamicTwoFactorAuthPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('requests the recovery codes when 2FA is not enabled and there are no codes', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false});

        await renderPage();

        expect(mockToggleTwoFactorAuth).toHaveBeenCalledTimes(1);
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledWith(true);
    });

    it('returns to the success page without enabling 2FA again during the forced onboarding handoff, when 2FA is enabled and the codes are gone', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: true, twoFactorAuthSetupInProgress: true});

        await renderPage();

        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_SUCCESS.path, 'settings/security'), {forceReplace: true});
    });

    it('keeps the recovery codes page when 2FA is enabled, setup is in progress and the codes are still there', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: true, twoFactorAuthSetupInProgress: true, recoveryCodes: 'aaaa, bbbb'});

        await renderPage();

        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('goes back out of the flow when 2FA is enabled and there is a route to pop', async () => {
        mockCanGoBack.mockReturnValue(true);
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: true});

        await renderPage();

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
    });

    it('opens the enabled page when 2FA is enabled and there is nothing to pop', async () => {
        mockCanGoBack.mockReturnValue(false);
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: true});

        await renderPage();

        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_2FA_ENABLED, {forceReplace: true});
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
    });
});
