import type * as NativeNavigation from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import Text from '@components/Text';
import withAgentAccessDenied from '@libs/Navigation/AppNavigator/withAgentAccessDenied';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    isActiveRoute: jest.fn(() => false),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    const react = jest.requireActual<typeof React>('react');
    return {
        ...actualNav,
        useFocusEffect: (effect: React.EffectCallback) => {
            react.useEffect(effect, [effect]);
        },
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
        <ComposeProviders components={[LocaleContextProvider]}>
            <Component />
        </ComposeProviders>,
    );
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
        jest.mocked(Navigation.navigate).mockClear();
        jest.mocked(Navigation.dismissModal).mockClear();
        jest.mocked(Navigation.isActiveRoute).mockReturnValue(false);
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(false);
    });

    it('redirects agent account to the profile page instead of rendering the wrapped component', async () => {
        await TestHelper.signInWithTestUser(1, 'agent_123@expensify.ai');
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

    it('dismisses the modal instead of navigating when a guarded screen is open inside an RHP', async () => {
        // Reproduces the copilot loop: the owner taps "Copilot into account" from the agent-edit page, which
        // lives in an RHP. Navigating to the tab-nested Profile route while the RHP is focused would be forced
        // to PUSH, so we must dismiss the modal first to reveal the underlying guarded central pane.
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(true);
        await TestHelper.signInWithTestUser(1, 'agent_123@expensify.ai');
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('protected-content')).toBeNull();
            expect(Navigation.dismissModal).toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });

    it('shows access denied view instead of redirecting when agent is already on the redirect target', async () => {
        jest.mocked(Navigation.isActiveRoute).mockReturnValue(true);
        await TestHelper.signInWithTestUser(1, 'agent_123@expensify.ai');
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
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeDefined();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });
});
