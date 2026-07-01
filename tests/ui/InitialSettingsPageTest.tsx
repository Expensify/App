import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import type * as ReactNavigation from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import usePermissions from '@hooks/usePermissions';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import InitialSettingsPage from '@pages/settings/InitialSettingsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    clearPreloadedRoutes: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(() => ({params: {}})),
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@userActions/Wallet', () => ({
    openInitialSettingsPage: jest.fn(),
}));

jest.mock('@userActions/App', () => ({
    setLocale: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/useIsSidebarRouteActive', () => jest.fn(() => false));

jest.mock('@hooks/useSubscriptionPlan', () => jest.fn(() => null));

jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => false})));

jest.mock('@components/AccountSwitcher', () => {
    function MockAccountSwitcher() {
        return null;
    }
    MockAccountSwitcher.displayName = 'AccountSwitcher';
    return MockAccountSwitcher;
});

jest.mock('@components/AccountSwitcherSkeletonView', () => {
    function MockAccountSwitcherSkeletonView() {
        return null;
    }
    MockAccountSwitcherSkeletonView.displayName = 'AccountSwitcherSkeletonView';
    return MockAccountSwitcherSkeletonView;
});

jest.mock('@components/Navigation/TabBarBottomContent', () => {
    function MockTabBarBottomContent() {
        return null;
    }
    MockTabBarBottomContent.displayName = 'TabBarBottomContent';
    return MockTabBarBottomContent;
});

jest.mock('@components/Navigation/TopBarWithLoadingBar', () => {
    function MockTopBarWithLoadingBar() {
        return null;
    }
    MockTopBarWithLoadingBar.displayName = 'TopBarWithLoadingBar';
    return MockTopBarWithLoadingBar;
});

jest.mock('@components/MenuItem', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{testID: string; children?: React.ReactNode}>};
    return ({title}: {title: string}) => ReactMock.createElement(Text, {testID: `menu-item-${String(title)}`}, title);
});

const mockUsePermissions = jest.mocked(usePermissions);
const mockUseSubscriptionPlan = jest.mocked(useSubscriptionPlan);

const Stack = createPlatformStackNavigator<SettingsSplitNavigatorParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.ROOT}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.ROOT}
                            component={InitialSettingsPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('InitialSettingsPage - agent account', () => {
    const accountID = 123;

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
        jest.clearAllMocks();
        mockUsePermissions.mockImplementation(() => ({isBetaEnabled: () => false}));
        mockUseSubscriptionPlan.mockImplementation(() => null);
    });

    async function setupUser(email: string) {
        await TestHelper.signInWithTestUser(accountID, email);

        const personalDetails: PersonalDetailsList = {
            [accountID]: {
                accountID,
                login: email,
                displayName: email,
                avatar: 'https://example.com/avatar.png',
                avatarThumbnail: 'https://example.com/avatar.png',
            } as PersonalDetails,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        await waitForBatchedUpdatesWithAct();
    }

    it('hides Wallet, Preferences and Security for agent account', async () => {
        await setupUser('agent_123@expensify.ai');

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('menu-item-Wallet')).toBeNull();
            expect(screen.queryByTestId('menu-item-Preferences')).toBeNull();
            expect(screen.queryByTestId('menu-item-Security')).toBeNull();
        });
    });

    it('shows Copilot for agent account', async () => {
        await setupUser('agent_123@expensify.ai');

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-Copilot')).toBeDefined();
        });
    });

    it('shows Wallet, Preferences and Security for non-agent account', async () => {
        await setupUser('user@expensify.com');

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-Wallet')).toBeDefined();
            expect(screen.getByTestId('menu-item-Preferences')).toBeDefined();
            expect(screen.getByTestId('menu-item-Security')).toBeDefined();
        });
    });

    it('hides Subscription for agent account', async () => {
        mockUseSubscriptionPlan.mockReturnValue(CONST.POLICY.TYPE.TEAM);
        await setupUser('agent_123@expensify.ai');

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('menu-item-Subscription')).toBeNull();
        });
    });

    it('shows Subscription for non-agent account', async () => {
        mockUseSubscriptionPlan.mockReturnValue(CONST.POLICY.TYPE.TEAM);
        await setupUser('user@expensify.com');

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-Subscription')).toBeDefined();
        });
    });

    it('hides Agents for agent account when CUSTOM_AGENT beta is enabled', async () => {
        mockUsePermissions.mockReturnValue({isBetaEnabled: (beta: string) => beta === CONST.BETAS.CUSTOM_AGENT});
        await setupUser('agent_123@expensify.ai');

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('menu-item-Agents')).toBeNull();
        });
    });

    it('shows Agents for non-agent account when CUSTOM_AGENT beta is enabled', async () => {
        mockUsePermissions.mockReturnValue({isBetaEnabled: (beta: string) => beta === CONST.BETAS.CUSTOM_AGENT});
        await setupUser('user@expensify.com');

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-Agents')).toBeDefined();
        });
    });
});
