import {NavigationContainer} from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import DebugTabView from '@components/Navigation/DebugTabView';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import OnyxProvider from '@components/OnyxProvider';
import {SidebarOrderedReportsContextProvider} from '@hooks/useSidebarOrderedReports';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@src/hooks/useRootNavigationState');

describe('NavigationTabBar', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
    });
    beforeEach(() => {
        Onyx.clear();
    });
    describe('Home tab', () => {
        describe('Debug mode enabled', () => {
            beforeEach(() => {
                Onyx.set(ONYXKEYS.ACCOUNT, {isDebugModeEnabled: true});
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

                    render(
                        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, SidebarOrderedReportsContextProvider]}>
                            <NavigationContainer>
                                <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />
                            </NavigationContainer>
                        </ComposeProviders>,
                    );

                    expect(await screen.findByTestId(DebugTabView.displayName)).toBeOnTheScreen();
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

                    render(
                        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, SidebarOrderedReportsContextProvider]}>
                            <NavigationContainer>
                                <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />
                            </NavigationContainer>
                        </ComposeProviders>,
                    );

                    expect(await screen.findByTestId(DebugTabView.displayName)).toBeOnTheScreen();
                });
            });
        });
    });
    describe('Settings tab', () => {
        describe('Debug mode enabled', () => {
            beforeEach(() => {
                Onyx.set(ONYXKEYS.ACCOUNT, {isDebugModeEnabled: true});
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

                    render(
                        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, SidebarOrderedReportsContextProvider]}>
                            <NavigationContainer>
                                <NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />
                            </NavigationContainer>{' '}
                        </ComposeProviders>,
                    );

                    expect(await screen.findByTestId(DebugTabView.displayName)).toBeOnTheScreen();
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

                    render(
                        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, SidebarOrderedReportsContextProvider]}>
                            <NavigationContainer>
                                <NavigationTabBar selectedTab={NAVIGATION_TABS.SETTINGS} />
                            </NavigationContainer>{' '}
                        </ComposeProviders>,
                    );

                    expect(await screen.findByTestId(DebugTabView.displayName)).toBeOnTheScreen();
                });
            });
        });
    });
});
