import {act, render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import DynamicTwoFactorAuthPage from '@pages/settings/Security/TwoFactorAuth/DynamicTwoFactorAuthPage';

import {toggleTwoFactorAuth} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx';

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

const PAGE_ROUTE = {key: 'codes-page', name: SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT};
const VERIFY_ROUTE = {key: 'verify-page', name: SCREENS.TWO_FACTOR_AUTH.DYNAMIC_VERIFY};

type StackState = ReactNavigationNative.NavigationState;
type StateCallback = (state: StackState) => ReactNavigationNative.NavigationAction;

function buildStackState(routes: Array<{key: string; name: string}>): StackState {
    return {key: 'two-factor-auth-stack', index: routes.length - 1, routeNames: routes.map((stackRoute) => stackRoute.name), routes, stale: false, type: 'stack'};
}

const mockDispatch = jest.fn<void, [StateCallback]>();
const mockGetState = jest.fn<StackState, []>();

function Page() {
    return (
        <OnyxListItemProvider>
            <DynamicTwoFactorAuthPage
                // @ts-expect-error -- the page only uses `dispatch` and `getState`, so the test passes a partial navigation object
                navigation={{dispatch: mockDispatch, getState: mockGetState}}
                route={PAGE_ROUTE}
            />
        </OnyxListItemProvider>
    );
}

function isStackState(value: unknown): value is StackState {
    return typeof value === 'object' && value !== null && 'routes' in value;
}

/** Applies the state callback the page dispatched to a 2FA stack with this page under the verify page. */
function getStateAfterDispatch(): StackState | undefined {
    const callback = mockDispatch.mock.calls.at(0)?.at(0);
    const payload = callback?.(buildStackState([PAGE_ROUTE, VERIFY_ROUTE])).payload;
    return isStackState(payload) ? payload : undefined;
}

const mockToggleTwoFactorAuth = jest.mocked(toggleTwoFactorAuth);
const mockGoBack = jest.mocked(Navigation.goBack);
const mockNavigate = jest.mocked(Navigation.navigate);

const renderPage = async () => {
    const view = render(<Page />);
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return view;
};

const setFocused = async (view: ReturnType<typeof render>, isFocused: boolean) => {
    mockIsFocused = isFocused;
    view.rerender(<Page />);
    await act(async () => {
        await waitForBatchedUpdates();
    });
};

const updateAccount = async (values: Partial<Account>, shouldReplace = false) => {
    await act(async () => {
        await (shouldReplace ? Onyx.set(ONYXKEYS.ACCOUNT, values) : Onyx.merge(ONYXKEYS.ACCOUNT, values));
        await waitForBatchedUpdates();
    });
};

describe('DynamicTwoFactorAuthPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsFocused = true;
        mockGetState.mockReturnValue(buildStackState([PAGE_ROUTE, VERIFY_ROUTE]));
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

        // Then it shows the enabled page in its place, as on main, because there is nothing to set up
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_2FA_ENABLED, {forceReplace: true});
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
    });

    it('opens the enabled page when 2FA turns on elsewhere while it is on top and no setup is in progress', async () => {
        // Given the page is open and on top with 2FA off, and the user has not started the download or copy step
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false, recoveryCodes: RECOVERY_CODES});
        await renderPage();

        // When 2FA turns on from another device
        await updateAccount({requiresTwoFactorAuth: true});

        // Then it shows the enabled page in its place, as on main, so native and stale local data keep the old behaviour
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_2FA_ENABLED, {forceReplace: true});
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('removes itself from the stack when 2FA gets enabled while it is under the verify page', async () => {
        // Given the page was opened during setup and is now covered by the verify page, as on web where Download codes pushes it
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false, recoveryCodes: RECOVERY_CODES});
        const view = await renderPage();
        await setFocused(view, false);

        // When the user finishes the verify step and 2FA turns on
        await updateAccount({requiresTwoFactorAuth: true, twoFactorAuthSetupInProgress: true});

        // Then it removes only itself from the stack, because the success page reads its back path from the URL that the stack builds
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(getStateAfterDispatch()?.routes).toEqual([VERIFY_ROUTE]);
        expect(getStateAfterDispatch()?.index).toBe(0);
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
    });

    it('removes itself without other steps when the forced onboarding handoff resets the account', async () => {
        // Given the page was opened during setup and is now covered by the verify page
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false, recoveryCodes: RECOVERY_CODES});
        const view = await renderPage();
        await setFocused(view, false);

        // When the forced onboarding handoff replaces the account data, which drops `validated` and the recovery codes
        await updateAccount({requiresTwoFactorAuth: true, twoFactorAuthSetupInProgress: true, needsTwoFactorAuthSetup: false, isLoading: false}, true);

        // Then it only removes itself, because opening the verify-account step or enabling 2FA again would break the success page
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
    });

    it('does nothing while another screen covers it and it is the only page in the 2FA stack', async () => {
        // Given the page is the only page in its stack, and another modal covers it
        mockGetState.mockReturnValue(buildStackState([PAGE_ROUTE]));
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false, recoveryCodes: RECOVERY_CODES});
        const view = await renderPage();
        await setFocused(view, false);

        // When 2FA turns on from another device
        await updateAccount({requiresTwoFactorAuth: true, twoFactorAuthSetupInProgress: true});

        // Then it does not try to remove itself, because a stack without routes is not a valid state, and it does not navigate
        // while it is hidden
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('leaves the flow without enabling 2FA again when it is on top with 2FA on and setup still in progress', async () => {
        // Given 2FA is on, the setup is not closed yet, and the recovery codes are gone
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: true, twoFactorAuthSetupInProgress: true});

        // When the recovery codes page is on top
        await renderPage();

        // Then it leaves the flow and does not send the enable request, because that request would replace the user's recovery codes
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockToggleTwoFactorAuth).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
    });
});
