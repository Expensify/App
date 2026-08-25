import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';

import withAgentAccessDenied from '@libs/Navigation/AppNavigator/withAgentAccessDenied';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    isActiveRoute: jest.fn(() => false),
    isTopmostRouteModalScreen: jest.fn(() => false),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

// Controls the simulated focus state of the guarded screen for both useFocusEffect (which only runs
// while focused) and useIsFocused. Defaults to focused; set to false to simulate a mounted-but-unfocused
// central pane (e.g. a guarded pane sitting behind an unguarded RHP).
let mockIsScreenFocused = true;

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    const react = jest.requireActual<typeof React>('react');
    return {
        ...actualNav,
        useFocusEffect: (effect: React.EffectCallback) => {
            react.useEffect(() => {
                if (!mockIsScreenFocused) {
                    return;
                }
                return effect();
            }, [effect]);
        },
        useIsFocused: () => mockIsScreenFocused,
    };
});

jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));

function ProtectedContent() {
    return <Text testID="protected-content">Protected Content</Text>;
}

const getProtectedComponent = withAgentAccessDenied(() => ProtectedContent);

function renderComponent() {
    const Component = getProtectedComponent();
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <Component />
        </ComposeProviders>,
    );
}

async function signInAsAgent() {
    const accountID = 1;
    await TestHelper.signInWithTestUser(accountID, 'testbot_123@expensify.ai');
    await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
    await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [accountID]: {
            accountID,
            login: 'testbot_123@expensify.ai',
            isCustomAgent: true,
        },
    });
}

describe('withAgentAccessDenied', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en' as const);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    beforeEach(() => {
        mockIsScreenFocused = true;
        jest.mocked(Navigation.navigate).mockClear();
        jest.mocked(Navigation.dismissModal).mockClear();
        jest.mocked(Navigation.isActiveRoute).mockReturnValue(false);
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(false);
    });

    it('redirects agent account to the profile page instead of rendering the wrapped component', async () => {
        await signInAsAgent();
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('protected-content')).toBeNull();
            // forceReplace ensures we REPLACE the stale guarded route instead of PUSHing Profile on top of it,
            // which would otherwise trap the user in a Profile <-> Profile loop on back navigation.
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_PROFILE.getRoute(), {forceReplace: true});
            expect(Navigation.dismissModal).not.toHaveBeenCalled();
        });
    });

    it('dismisses the modal first and defers the Profile redirect when a guarded screen is open inside an RHP', async () => {
        // Reproduces the copilot loop: the owner taps "Copilot into account" from the agent-edit page, which
        // lives in an RHP. Navigating to the tab-nested Profile route while the RHP is focused would be forced
        // to PUSH, so we dismiss the modal first and redirect once it has finished dismissing.
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(true);
        await signInAsAgent();
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('protected-content')).toBeNull();
            expect(Navigation.dismissModal).toHaveBeenCalled();
            // The redirect is deferred until the modal finishes dismissing, so it is not dispatched synchronously.
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        // Invoking the afterTransition callback (fired once the modal closes) performs the Profile redirect,
        // guaranteeing the agent lands on Profile even when the revealed pane is not itself guarded.
        const afterTransition = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0)?.afterTransition;
        act(() => afterTransition?.());
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_PROFILE.getRoute(), {forceReplace: true});
    });

    it('redirects a mounted-but-unfocused guarded pane when the session flips to an agent (copilot from an unguarded RHP)', async () => {
        // Reproduces the deploy blocker: the owner taps "Copilot into account" from the agent DM, which lives in
        // an unguarded RHP sitting over the guarded Agents central pane. That pane is mounted but NOT focused, so
        // useFocusEffect never fires and it would render null (blank background). The focus-independent effect must
        // still redirect. The agent DM RHP is the topmost modal, so it is dismissed first and the redirect deferred.
        mockIsScreenFocused = false;
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(true);
        await signInAsAgent();
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('protected-content')).toBeNull();
            expect(Navigation.dismissModal).toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        const afterTransition = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0)?.afterTransition;
        act(() => afterTransition?.());
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_PROFILE.getRoute(), {forceReplace: true});
    });

    it('shows access denied view instead of redirecting when agent is already on the redirect target', async () => {
        jest.mocked(Navigation.isActiveRoute).mockReturnValue(true);
        await signInAsAgent();
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('protected-content')).toBeNull();
            expect(screen.getByText('Not so fast...')).toBeDefined();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });

    it('renders wrapped component for non-agent account', async () => {
        await TestHelper.signInWithTestUser(1, 'user@expensify.com');
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeDefined();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });

    it('does not render wrapped component while agent identity is loading', async () => {
        await TestHelper.signInWithTestUser(1, 'user@expensify.com');
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('protected-content')).toBeNull();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        await act(async () => {
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        });

        await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeDefined();
        });
    });

    it('keeps rendering the wrapped component when a mid-session OpenApp sets isLoadingApp back to true', async () => {
        // enabling 2FA runs OpenApp again while
        // the user is already deep in the app. Agent identity is known by then, so the guarded screen must stay
        // mounted instead of blanking out for the length of that request.
        await TestHelper.signInWithTestUser(1, 'user@expensify.com');
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.HAS_LOADED_APP]: true,
        });
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('protected-content')).toBeDefined();

        await act(async () => {
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('protected-content')).toBeDefined();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
