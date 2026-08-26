import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';

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

import type * as ReactNavigation from '@react-navigation/native';
import type ReactNative from 'react-native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {addDays, format as formatDate, subDays} from 'date-fns';
import React from 'react';
import {DeviceEventEmitter} from 'react-native';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
import createRandomPolicy from '../utils/collections/policies';
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
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({
        title,
        brickRoadIndicator,
        badgeText,
        isBadgeSuccess,
        isBadgeCondensed,
    }: {
        title: string;
        brickRoadIndicator?: string;
        badgeText?: string;
        isBadgeSuccess?: boolean;
        isBadgeCondensed?: boolean;
    }) =>
        ReactMock.createElement(
            ReactMock.Fragment,
            null,
            ReactMock.createElement(Text, {testID: `menu-item-${String(title)}`}, title),
            brickRoadIndicator ? ReactMock.createElement(Text, {testID: `decoration-${String(title)}-rbr`}, brickRoadIndicator) : null,
            badgeText ? ReactMock.createElement(Text, {testID: `decoration-${String(title)}-badge`}, badgeText) : null,
            isBadgeSuccess ? ReactMock.createElement(Text, {testID: `decoration-${String(title)}-badge-success`}) : null,
            isBadgeCondensed ? ReactMock.createElement(Text, {testID: `decoration-${String(title)}-badge-condensed`}) : null,
        );
});

const mockUsePermissions = jest.mocked(usePermissions);
const mockUseSubscriptionPlan = jest.mocked(useSubscriptionPlan);

const Stack = createPlatformStackNavigator<SettingsSplitNavigatorParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrentReportIDContextProvider, CurrencyListContextProvider]}>
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

function getMenuItemTitles() {
    return screen.getAllByTestId(/^menu-item-/).flatMap((item) => item.children.filter((child): child is string => typeof child === 'string'));
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

    async function setupUser(email: string, isCustomAgent = false) {
        await TestHelper.signInWithTestUser(accountID, email);

        const personalDetails: PersonalDetailsList = {
            [accountID]: {
                accountID,
                login: email,
                displayName: email,
                avatar: 'https://example.com/avatar.png',
                avatarThumbnail: 'https://example.com/avatar.png',
                isCustomAgent,
            } as PersonalDetails,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        await waitForBatchedUpdatesWithAct();
    }

    it('shows Wallet, Preferences and Security for agent account', async () => {
        await setupUser('testbot_123@expensify.ai', true);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-Wallet')).toBeDefined();
            expect(screen.getByTestId('menu-item-Preferences')).toBeDefined();
            expect(screen.getByTestId('menu-item-Security')).toBeDefined();
        });
    });

    it('shows Copilot for agent account', async () => {
        await setupUser('testbot_123@expensify.ai', true);

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
            expect(getMenuItemTitles()).toEqual([
                'Profile',
                'Wallet',
                'Expense rules',
                'Preferences',
                'Copilot',
                'Security',
                'Help',
                "What's new",
                'About',
                'Troubleshoot',
                'Save the world',
                'Sign out',
            ]);
        });
    });

    it('shows Subscription for agent account', async () => {
        mockUseSubscriptionPlan.mockReturnValue(CONST.POLICY.TYPE.TEAM);
        await setupUser('testbot_123@expensify.ai', true);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-Subscription')).toBeDefined();
            expect(getMenuItemTitles().slice(0, 3)).toEqual(['Profile', 'Subscription', 'Wallet']);
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

    it('shows Subscription for an outstanding balance without an active subscription', async () => {
        await setupUser('user@expensify.com');
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(getMenuItemTitles().slice(0, 3)).toEqual(['Profile', 'Subscription', 'Wallet']);
        });
    });

    it('preserves dynamic menu decorations and general menu ordering', async () => {
        mockUseSubscriptionPlan.mockReturnValue(CONST.POLICY.TYPE.CORPORATE);
        mockUsePermissions.mockReturnValue({isBetaEnabled: (beta: string) => beta === CONST.BETAS.CUSTOM_AGENT});
        await setupUser('user@expensify.com');

        const policy = createRandomPolicy(accountID, CONST.POLICY.TYPE.CORPORATE);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.USER_WALLET, {
                tierName: CONST.WALLET.TIER_NAME.GOLD,
                currentBalance: 12345,
                errors: {wallet: 'Wallet error'},
            });
            await Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                errorFields: {phoneNumber: {error: 'Invalid phone number'}},
            });
            await Onyx.set(ONYXKEYS.LOGINS, {
                device: {
                    created: '2026-01-01',
                    accountID,
                    partnerID: CONST.PARTNER_ID.ANDROID,
                    partnerUserID: 'device',
                    lastLogin: '2026-01-01',
                    validatedDate: null,
                    errorFields: {revoke: {error: 'Unable to revoke device'}},
                },
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {
                nameErrors: {error: 'Agent name error'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, formatDate(subDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING));
            await Onyx.set(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, formatDate(addDays(new Date(), 5), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING));
            await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        });

        renderPage();
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('decoration-Profile-rbr').children).toEqual([CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR]);
            expect(screen.getByTestId('decoration-Wallet-rbr').children).toEqual([CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR]);
            expect(screen.getByTestId('decoration-Wallet-badge').children).toEqual(['$123.45']);
            expect(screen.getByTestId('decoration-Security-rbr').children).toEqual([CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR]);
            expect(screen.getByTestId('decoration-Agents-rbr').children).toEqual([CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR]);
            expect(screen.getByTestId('decoration-Agents-badge').children).toEqual(['Beta']);
            expect(screen.getByTestId('decoration-Subscription-badge').children).toEqual([expect.any(String)]);
            expect(screen.getByTestId('decoration-Subscription-badge-success')).toBeDefined();
            expect(screen.getByTestId('decoration-Subscription-badge-condensed')).toBeDefined();

            const menuItemTitles = getMenuItemTitles();
            expect(menuItemTitles.slice(menuItemTitles.indexOf('Help'))).toEqual(['Help', "What's new", 'About', 'Troubleshoot', 'Save the world', 'Sign out']);
        });
    });

    it('hides Agents for agent account when CUSTOM_AGENT beta is enabled', async () => {
        mockUsePermissions.mockReturnValue({isBetaEnabled: (beta: string) => beta === CONST.BETAS.CUSTOM_AGENT});
        await setupUser('testbot_123@expensify.ai', true);

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
            expect(getMenuItemTitles().slice(0, 5)).toEqual(['Profile', 'Wallet', 'Expense rules', 'Agents', 'Preferences']);
        });
    });
});

describe('InitialSettingsPage - scrolling', () => {
    const accountID = 456;

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
    });

    it('should emit a scrolling event so anchored tooltips can follow or hide', async () => {
        mockUsePermissions.mockImplementation(() => ({isBetaEnabled: () => false}));
        mockUseSubscriptionPlan.mockImplementation(() => null);
        await TestHelper.signInWithTestUser(accountID, 'user@expensify.com');
        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // The account switcher's tooltip is anchored inside this list, so the page has to announce scrolls.
        const scrollView = screen.UNSAFE_getByType(ScrollView);
        fireEvent.scroll(scrollView, {
            nativeEvent: {
                contentOffset: {y: 120, x: 0},
                layoutMeasurement: {height: 800, width: 400},
                contentSize: {height: 2400, width: 400},
            },
        });

        expect(emitSpy).toHaveBeenCalledWith(CONST.EVENTS.SCROLLING, true);
        emitSpy.mockRestore();
    });
});
