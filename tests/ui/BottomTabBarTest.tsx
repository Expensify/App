import {NavigationContainer} from '@react-navigation/native';
import {cleanup, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import DebugTabView from '@components/Navigation/DebugTabView';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import {SidebarOrderedReportsContextProvider} from '@hooks/useSidebarOrderedReports';
import type Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import variables from '@styles/variables';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

// Configurable per-test: simulates which tab is currently focused inside TAB_NAVIGATOR.
jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const setMockFocusedTab = (tabName: string) => {
    (useRootNavigationState as jest.Mock).mockImplementation((selector: (state: unknown) => unknown) =>
        selector({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        routes: [{name: tabName, params: {}}],
                        index: 0,
                    },
                },
            ],
            index: 0,
        }),
    );
};

// Mock useResponsiveLayout so layout mode can be overridden per-test
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280})));

// Mock useNavigationState to avoid "Couldn't get the navigation state" error from child components
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useNavigationState: () => ({
            routes: [],
        }),
    };
});

jest.mock('@hooks/useRestoreWorkspacesTabOnNavigate', () => jest.fn(() => jest.fn()));

// Helper function to render with proper navigation setup
const renderWithNavigation = (component: React.ReactElement) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, SidebarOrderedReportsContextProvider]}>
            <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                    // Navigation is ready, but we still need to handle the timing issue
                }}
            >
                {component}
            </NavigationContainer>
        </ComposeProviders>,
    );
};

describe('DebugTabView', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });
    beforeEach(() => {
        Onyx.clear([ONYXKEYS.NVP_PREFERRED_LOCALE]);
        (useResponsiveLayout as jest.Mock).mockReturnValue({shouldUseNarrowLayout: true});
    });

    afterEach(async () => {
        cleanup();
        jest.clearAllMocks();
        await Onyx.clear();
    });
    describe('Inbox tab', () => {
        describe('Debug mode enabled', () => {
            beforeEach(() => {
                setMockFocusedTab(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
                Onyx.set(ONYXKEYS.IS_DEBUG_MODE_ENABLED, true);
            });
            describe('Has GBR', () => {
                it('renders DebugTabView', async () => {
                    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, {
                        reportID: '1',
                        reportName: 'My first report',
                        chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                        type: CONST.REPORT.TYPE.CHAT,
                        hasOutstandingChildTask: true,
                        lastMessageText: 'Hello world!',
                    });

                    renderWithNavigation(<DebugTabView selectedTab={NAVIGATION_TABS.INBOX} />);

                    expect(await screen.findByTestId('DebugTabView')).toBeOnTheScreen();
                });
            });
            describe('Has RBR', () => {
                it('renders DebugTabView', async () => {
                    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, {
                        reportID: '1',
                        reportName: 'My first report',
                        chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                        type: CONST.REPORT.TYPE.CHAT,
                        errorFields: {
                            error: {
                                message: 'Some error occurred!',
                            },
                        },
                        lastMessageText: 'Hello world!',
                    });

                    renderWithNavigation(<DebugTabView selectedTab={NAVIGATION_TABS.INBOX} />);

                    expect(await screen.findByTestId('DebugTabView')).toBeOnTheScreen();
                });
            });
        });
    });
    describe('Settings tab', () => {
        describe('Debug mode enabled', () => {
            beforeEach(() => {
                setMockFocusedTab(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
                Onyx.set(ONYXKEYS.IS_DEBUG_MODE_ENABLED, true);
            });
            describe('Has GBR', () => {
                it('renders DebugTabView', async () => {
                    await Onyx.multiSet({
                        [ONYXKEYS.SESSION]: {
                            email: 'foo@bar.com',
                        },
                        [ONYXKEYS.LOGIN_LIST]: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'foo@bar.com': {
                                partnerUserID: 'john.doe@mail.com',
                                validatedDate: undefined,
                            },
                        },
                    });

                    renderWithNavigation(<DebugTabView selectedTab={NAVIGATION_TABS.SETTINGS} />);

                    expect(await screen.findByTestId('DebugTabView')).toBeOnTheScreen();
                });
            });
            describe('Has RBR', () => {
                it('renders DebugTabView', async () => {
                    await Onyx.set(ONYXKEYS.LOGIN_LIST, {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'foo@bar.com': {
                            partnerUserID: 'john.doe@mail.com',
                            errorFields: {
                                partnerName: {
                                    message: 'Partner name is missing!',
                                },
                            },
                        },
                    });

                    renderWithNavigation(<DebugTabView selectedTab={NAVIGATION_TABS.SETTINGS} />);

                    expect(await screen.findByTestId('DebugTabView')).toBeOnTheScreen();
                });
            });
        });
    });

    describe('Wide layout', () => {
        beforeEach(() => {
            (useResponsiveLayout as jest.Mock).mockReturnValue({shouldUseNarrowLayout: false});
            Onyx.set(ONYXKEYS.IS_DEBUG_MODE_ENABLED, true);
            Onyx.set(ONYXKEYS.LOGIN_LIST, {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'foo@bar.com': {
                    partnerUserID: 'john.doe@mail.com',
                    errorFields: {
                        partnerName: {
                            message: 'Partner name is missing!',
                        },
                    },
                },
            });
        });

        it('positions at sidebar width for settings tab', async () => {
            setMockFocusedTab(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);

            renderWithNavigation(<DebugTabView selectedTab={NAVIGATION_TABS.SETTINGS} />);

            const container = await screen.findByTestId('DebugTabViewContainer');
            expect(container.props.pointerEvents).toBe('box-none');
            expect((container.props.style as Array<Record<string, unknown>>).at(0)).toEqual(
                expect.objectContaining({
                    bottom: 0,
                    left: variables.navigationTabBarSize,
                    width: variables.sideBarWithLHBWidth - variables.cropBorderWidth,
                }),
            );
        });

        it('positions at full width for workspaces tab', async () => {
            setMockFocusedTab(SCREENS.WORKSPACES_LIST);

            renderWithNavigation(<DebugTabView selectedTab={NAVIGATION_TABS.WORKSPACES} />);

            const container = await screen.findByTestId('DebugTabViewContainer');
            expect(container.props.pointerEvents).toBe('box-none');
            expect((container.props.style as Array<Record<string, unknown>>).at(0)).toEqual(
                expect.objectContaining({
                    bottom: 0,
                    left: variables.navigationTabBarSize,
                    width: 1280 - variables.navigationTabBarSize,
                }),
            );
        });
    });
});
