import {NavigationContainer} from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import BottomTabBar from '@components/Navigation/BottomTabBar';
import BOTTOM_TABS from '@components/Navigation/BottomTabBar/BOTTOM_TABS';
import DebugTabView from '@components/Navigation/DebugTabView';
import OnyxProvider from '@components/OnyxProvider';
import {ReportIDsContextProvider} from '@hooks/useReportIDs';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@src/hooks/useRootNavigationState');

describe('BottomTabBar', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });
    beforeEach(() => {
        Onyx.clear();
    });
    describe('Home tab', () => {
        describe('Debug mode enabled', () => {
            beforeEach(() => {
                Onyx.set(ONYXKEYS.USER, {isDebugModeEnabled: true});
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
                        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, ReportIDsContextProvider]}>
                            <NavigationContainer>
                                <BottomTabBar selectedTab={BOTTOM_TABS.HOME} />
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
                        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, ReportIDsContextProvider]}>
                            <NavigationContainer>
                                <BottomTabBar selectedTab={BOTTOM_TABS.HOME} />
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
                Onyx.set(ONYXKEYS.USER, {isDebugModeEnabled: true});
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
                        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, ReportIDsContextProvider]}>
                            <NavigationContainer>
                                <BottomTabBar selectedTab={BOTTOM_TABS.SETTINGS} />
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
                        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, ReportIDsContextProvider]}>
                            <NavigationContainer>
                                <BottomTabBar selectedTab={BOTTOM_TABS.SETTINGS} />
                            </NavigationContainer>{' '}
                        </ComposeProviders>,
                    );

                    expect(await screen.findByTestId(DebugTabView.displayName)).toBeOnTheScreen();
                });
            });
        });
    });
});
