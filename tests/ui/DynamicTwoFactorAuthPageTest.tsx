import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import DynamicTwoFactorAuthPage from '@pages/settings/Security/TwoFactorAuth/DynamicTwoFactorAuthPage';

import {toggleTwoFactorAuth} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const RECOVERY_CODES = 'aaaa1111, bbbb2222';

let mockIsFocused = true;

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => mockIsFocused,
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        isNavigationReady: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/security'));

jest.mock('@userActions/Session', () => ({
    toggleTwoFactorAuth: jest.fn(),
}));

jest.mock('@userActions/TwoFactorAuthActions', () => ({
    quitAndNavigateBack: jest.fn(),
    setCodesAreCopied: jest.fn(),
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
const mockGoBack = jest.mocked(Navigation.goBack);
const mockNavigate = jest.mocked(Navigation.navigate);

function Page() {
    return (
        <OnyxListItemProvider>
            <DynamicTwoFactorAuthPage />
        </OnyxListItemProvider>
    );
}

const renderPage = async () => {
    const view = render(<Page />);
    await waitForBatchedUpdates();
    return view;
};

describe('DynamicTwoFactorAuthPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsFocused = true;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('requests the recovery codes when 2FA is off and there are no codes', async () => {
        // Given a validated account without 2FA and without recovery codes
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false});

        // When the recovery codes page opens
        await renderPage();

        // Then it asks the server for the codes once, because this page is the first step of the setup
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledTimes(1);
        expect(mockToggleTwoFactorAuth).toHaveBeenCalledWith(true);
    });

    it('opens the enabled page when it is opened with 2FA already on', async () => {
        // Given an account that already has 2FA and no setup in progress
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: true});

        // When the recovery codes page is opened directly
        await renderPage();

        // Then it shows the enabled page in its place, because there is nothing to set up, and it must not leave the flow
        // or enable 2FA again
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_2FA_ENABLED, {forceReplace: true});
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
    });

    it('leaves the flow when 2FA gets enabled while the page is still open', async () => {
        // Given the page was opened during setup, so on web it stays in the browser history under the verify and success pages
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false, recoveryCodes: RECOVERY_CODES});
        await renderPage();

        // When the user finishes the verify step and then comes back to this page with browser Back
        await Onyx.merge(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true, twoFactorAuthSetupInProgress: true});
        await waitForBatchedUpdates();

        // Then it leaves the flow, because the recovery codes step must not be shown again once 2FA is on
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
    });

    it('does nothing while it is hidden and the forced onboarding handoff resets the account', async () => {
        // Given the page was opened during setup and is now covered by the success page
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false, recoveryCodes: RECOVERY_CODES});
        const view = await renderPage();
        mockIsFocused = false;
        view.rerender(<Page />);
        await waitForBatchedUpdates();

        // When the forced onboarding handoff replaces the account data, which drops `validated` and the recovery codes
        await Onyx.set(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true, twoFactorAuthSetupInProgress: true, needsTwoFactorAuthSetup: false, isLoading: false});
        await waitForBatchedUpdates();

        // Then the hidden page does not navigate and does not enable 2FA again, because either one would break the success page
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();

        // When the user then comes back to it with browser Back
        mockIsFocused = true;
        view.rerender(<Page />);
        await waitForBatchedUpdates();

        // Then it leaves the flow and does not start the verify-account step from the reset account data
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not enable 2FA again when it is opened with 2FA on and setup still in progress', async () => {
        // Given 2FA is on, the setup is not closed yet, and the recovery codes are gone
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: true, twoFactorAuthSetupInProgress: true});

        // When the recovery codes page opens
        await renderPage();

        // Then it does not send the enable request, because that request would replace the user's recovery codes
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
