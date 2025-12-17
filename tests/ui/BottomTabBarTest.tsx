import {NavigationContainer} from '@react-navigation/native';
import {cleanup, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SidebarOrderedReportsContextProvider} from '@hooks/useSidebarOrderedReports';
import navigationRef from '@libs/Navigation/navigationRef';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@src/hooks/useRootNavigationState', () => {
    return jest.fn(() => ({
        routes: [
            {
                name: 'Main',
                state: {
                    routes: [
                        {
                            name: 'Home',
                            params: {},
                        },
                    ],
                    index: 0,
                },
            },
        ],
        index: 0,
    }));
});

// Mock the specific function that's causing the navigation error
jest.mock('@libs/Navigation/helpers/navigateToWorkspacesPage', () => ({
    default: jest.fn(),
    getWorkspaceNavigationRouteState: jest.fn(() => ({
        lastWorkspacesTabNavigatorRoute: null,
        workspacesTabState: null,
        topmostFullScreenRoute: {
            name: 'Main',
            params: {},
        },
    })),
}));

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

describe('NavigationTabBar', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });
    beforeEach(() => {
        Onyx.clear([ONYXKEYS.NVP_PREFERRED_LOCALE]);
    });

    afterEach(async () => {
        cleanup();
        jest.clearAllMocks();
        await Onyx.clear();
    });
    describe('Home tab', () => {
        describe('Debug mode enabled', () => {
            beforeEach(() => {
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

                    renderWithNavigation(<NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />);

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

                    renderWithNavigation(<NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />);

                    expect(await screen.findByTestId('DebugTabView')).toBeOnTheScreen();
                });
            });
        });
    });
    describe('Settings tab', () => {
        describe('Debug mode enabled', () => {
            beforeEach(() => {
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

                    renderWithNavigation(<NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />);

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

                    renderWithNavigation(<NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />);

                    expect(await screen.findByTestId('DebugTabView')).toBeOnTheScreen();
                });
            });
        });
    });
});
