/* eslint-disable testing-library/no-node-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {setSidebarLoaded} from '@userActions/App';
import {subscribeToUserEvents} from '@userActions/User';
import App from '@src/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Participant} from '@src/types/onyx/Report';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import {navigateToSidebarOption} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(120000);

jest.mock('@libs/BootSplash', () => ({
    hide: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/components/ConfirmedRoute.tsx');

// Needed for: https://stackoverflow.com/questions/76903168/mocking-libraries-in-jest
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators', () => jest.fn());

jest.mock('@react-navigation/native');

// Mock Avatar component to prevent act() warnings from state updates during render
jest.mock('@src/components/Avatar', () => {
    const {View} = require('react-native');
    return ({source, name, avatarID, testID = 'Avatar'}: {source?: unknown; name?: string; avatarID?: string; testID?: string}) => {
        return (
            <View
                dataSet={{
                    name,
                    avatarID,
                    uri: typeof source === 'string' ? source : 'No Source',
                    parent: testID,
                }}
                testID="MockedAvatarData"
            />
        );
    };
});

// Mock ReportActionAvatars component to prevent act() warnings
jest.mock('@src/components/ReportActionAvatars', () => {
    const {View} = require('react-native');
    return ({participants, size = 'default'}: {participants?: unknown[]; size?: string}) => {
        return (
            <View
                dataSet={{
                    participants: Array.isArray(participants) ? participants.length : 0,
                    size,
                }}
                testID="MockedReportActionAvatars"
            />
        );
    };
});

// Mock Indicator component to prevent act() warnings
jest.mock('@src/components/Indicator', () => {
    const {View} = require('react-native');
    return ({isVisible = false, ...props}: {isVisible?: boolean; [key: string]: unknown}) => {
        return (
            <View
                dataSet={{
                    isVisible,
                    ...props,
                }}
                testID="MockedIndicator"
            />
        );
    };
});

// Mock TopBar component to prevent act() warnings
jest.mock('@src/components/Navigation/TopBar', () => {
    const {View} = require('react-native');
    return ({title, ...props}: {title?: string; [key: string]: unknown}) => {
        return (
            <View
                dataSet={{
                    title,
                    ...props,
                }}
                testID="MockedTopBar"
            />
        );
    };
});

// Mock NavigationTabBar component to prevent act() warnings
jest.mock('@src/components/Navigation/NavigationTabBar', () => {
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        return (
            <View
                dataSet={props}
                testID="MockedNavigationTabBar"
            />
        );
    };
});

// Mock FloatingActionButtonAndPopover component to prevent act() warnings
jest.mock('@src/pages/home/sidebar/FloatingActionButtonAndPopover', () => {
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        return (
            <View
                dataSet={props}
                testID="MockedFloatingActionButtonAndPopover"
            />
        );
    };
});

// Mock ProfileAvatarWithIndicator component to prevent act() warnings
jest.mock('@src/pages/home/sidebar/ProfileAvatarWithIndicator', () => {
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        return (
            <View
                dataSet={props}
                testID="MockedProfileAvatarWithIndicator"
            />
        );
    };
});

TestHelper.setupApp();

const REPORT_ID = '1';
const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';
const USER_B_ACCOUNT_ID = 2;
const USER_B_EMAIL = 'user_b@test.com';
const USER_C_ACCOUNT_ID = 3;
const USER_C_EMAIL = 'user_c@test.com';
const USER_D_ACCOUNT_ID = 4;
const USER_D_EMAIL = 'user_d@test.com';
const USER_E_ACCOUNT_ID = 5;
const USER_E_EMAIL = 'user_e@test.com';
const USER_F_ACCOUNT_ID = 6;
const USER_F_EMAIL = 'user_f@test.com';
const USER_G_ACCOUNT_ID = 7;
const USER_G_EMAIL = 'user_g@test.com';
const USER_H_ACCOUNT_ID = 8;
const USER_H_EMAIL = 'user_h@test.com';

/**
 * Sets up a test with a logged in user. Returns the <App/> test instance.
 */
function signInAndGetApp(reportName = '', participantAccountIDs?: number[]): Promise<void> {
    // Render the App and sign in as a test user.
    render(<App />);

    const participants: Record<number, Participant> = {};
    if (participantAccountIDs) {
        for (const id of participantAccountIDs) {
            participants[id] = {
                notificationPreference: 'always',
                hidden: false,
                role: id === 1 ? CONST.REPORT.ROLE.ADMIN : CONST.REPORT.ROLE.MEMBER,
            } as Participant;
        }
    }

    return waitForBatchedUpdatesWithAct()
        .then(async () => {
            await waitForBatchedUpdatesWithAct();
            const hintText = TestHelper.translateLocal('loginForm.loginForm');
            const loginForm = screen.queryAllByLabelText(hintText);
            expect(loginForm).toHaveLength(1);
        })
        .then(async () => TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A'))
        .then(() => {
            subscribeToUserEvents();
            return waitForBatchedUpdates();
        })
        .then(async () => {
            // Simulate setting an unread report and personal details
            await act(async () => {
                await Promise.all([
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                        reportID: REPORT_ID,
                        reportName,
                        lastMessageText: 'Test',
                        participants,
                        lastActorAccountID: USER_B_ACCOUNT_ID,
                        type: CONST.REPORT.TYPE.CHAT,
                        chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    }),
                    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                        [USER_A_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_A_EMAIL, USER_A_ACCOUNT_ID, 'A'),
                        [USER_B_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
                        [USER_C_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_C_EMAIL, USER_C_ACCOUNT_ID, 'C'),
                        [USER_D_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_D_EMAIL, USER_D_ACCOUNT_ID, 'D'),
                        [USER_E_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_E_EMAIL, USER_E_ACCOUNT_ID, 'E'),
                        [USER_F_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_F_EMAIL, USER_F_ACCOUNT_ID, 'F'),
                        [USER_G_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_G_EMAIL, USER_G_ACCOUNT_ID, 'G'),
                        [USER_H_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_H_EMAIL, USER_H_ACCOUNT_ID, 'H'),
                    }),
                ]);
            });

            // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
            setSidebarLoaded();
            return waitForBatchedUpdatesWithAct();
        });
}

/**
 * Tests for checking the group chat names at places like LHN, chat header, details page etc.
 * Note that limit of 5 names is only for the header.
 */
describe('Tests for group chat name', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        global.fetch = TestHelper.getGlobalFetchMock();
        // Unsubscribe to pusher channels
        PusherHelper.teardown();

        return Onyx.clear().then(waitForBatchedUpdates);
    });

    const participantAccountIDs4 = [USER_A_ACCOUNT_ID, USER_B_ACCOUNT_ID, USER_C_ACCOUNT_ID, USER_D_ACCOUNT_ID];
    const participantAccountIDs8 = [...participantAccountIDs4, USER_E_ACCOUNT_ID, USER_F_ACCOUNT_ID, USER_G_ACCOUNT_ID, USER_H_ACCOUNT_ID];

    it('Should show correctly in LHN', () =>
        signInAndGetApp('A, B, C, D', participantAccountIDs4).then(() => {
            // Verify the sidebar links are rendered
            const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
            const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);

            // Verify there is only one option in the sidebar
            const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            const displayNameHintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
            const displayNameText = screen.queryByLabelText(displayNameHintText);

            return waitFor(() => expect(displayNameText?.props?.children?.[0]).toBe('A, B, C, D'));
        }));

    it('Should show correctly in LHN when report name is not present', () =>
        signInAndGetApp('', participantAccountIDs4).then(() => {
            // Verify the sidebar links are rendered
            const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
            const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);

            // Verify there is only one option in the sidebar
            const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            const displayNameHintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
            const displayNameText = screen.queryByLabelText(displayNameHintText);

            return waitFor(() => expect(displayNameText?.props?.children?.[0]).toBe('A, B, C, D'));
        }));

    it('Should show limited names with ellipsis in LHN when 8 participants are present', () =>
        signInAndGetApp('', participantAccountIDs8).then(() => {
            // Verify the sidebar links are rendered
            const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
            const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);

            // Verify there is only one option in the sidebar
            const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            const displayNameHintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
            const displayNameText = screen.queryByLabelText(displayNameHintText);

            return waitFor(() => expect(displayNameText?.props?.children?.[0]).toBe('A, B, C, D, E...'));
        }));

    it('Check if group name shows fine for report header', () =>
        signInAndGetApp('', participantAccountIDs4)
            .then(() => {
                // Verify the sidebar links are rendered
                const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
                const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
                expect(sidebarLinks).toHaveLength(1);

                // Verify there is only one option in the sidebar
                const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
                expect(optionRows).toHaveLength(1);
                const displayNameHintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameText = screen.queryByLabelText(displayNameHintText);

                expect(displayNameText?.props?.children?.[0]).toBe('A, B, C, D');

                return navigateToSidebarOption(0);
            })
            .then(waitForBatchedUpdates)
            .then(async () => {
                const name = 'A, B, C, D';
                const displayNameTexts = screen.queryAllByLabelText(name);
                return waitFor(() => expect(displayNameTexts).toHaveLength(1));
            }));

    it('Should show only 5 names with ellipsis when there are 8 participants in the report header', () =>
        signInAndGetApp('', participantAccountIDs8)
            .then(async () => {
                // Wait for sidebar to be rendered
                await waitForBatchedUpdatesWithAct();
                const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
                const displayNameHintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');

                // Check sidebar links
                await waitFor(() => {
                    const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
                    expect(sidebarLinks).toHaveLength(1);
                });

                // Check option rows
                await waitFor(() => {
                    const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
                    expect(optionRows).toHaveLength(1);
                });

                // Check display name
                await waitFor(() => {
                    const displayNameText = screen.queryByLabelText(displayNameHintText);
                    expect(displayNameText?.props?.children?.[0]).toBe('A, B, C, D, E...');
                });
            })
            .then(() => navigateToSidebarOption(0))
            .then(waitForBatchedUpdates)
            .then(async () => {
                const name = 'A, B, C, D, E...';
                const displayNameTexts = screen.queryAllByLabelText(name);
                return waitFor(() => expect(displayNameTexts).toHaveLength(1));
            }));

    it('Should show exact name in header when report name is available with 4 participants', () =>
        signInAndGetApp('Test chat', participantAccountIDs4)
            .then(() => {
                // Verify the sidebar links are rendered
                const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
                const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
                expect(sidebarLinks).toHaveLength(1);

                // Verify there is only one option in the sidebar
                const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
                expect(optionRows).toHaveLength(1);
                const displayNameHintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameText = screen.queryByLabelText(displayNameHintText);

                expect(displayNameText?.props?.children?.[0]).toBe('Test chat');

                return navigateToSidebarOption(0);
            })
            .then(waitForBatchedUpdates)
            .then(async () => {
                const name = 'Test chat';
                const displayNameTexts = screen.queryAllByLabelText(name);
                return waitFor(() => expect(displayNameTexts).toHaveLength(1));
            }));

    it('Should show exact name in header when report name is available with 8 participants', () =>
        signInAndGetApp("Let's talk", participantAccountIDs8)
            .then(() => {
                // Verify the sidebar links are rendered
                const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
                const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
                expect(sidebarLinks).toHaveLength(1);

                // Verify there is only one option in the sidebar
                const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
                expect(optionRows).toHaveLength(1);
                const displayNameHintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameText = screen.queryByLabelText(displayNameHintText);

                expect(displayNameText?.props?.children?.[0]).toBe("Let's talk");

                return navigateToSidebarOption(0);
            })
            .then(waitForBatchedUpdates)
            .then(async () => {
                const name = "Let's talk";
                const displayNameTexts = screen.queryAllByLabelText(name);
                return waitFor(() => expect(displayNameTexts).toHaveLength(1));
            }));

    it('Should show last message preview in LHN', () =>
        signInAndGetApp('A, B, C, D', participantAccountIDs4).then(() => {
            // Verify the sidebar links are rendered
            const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
            const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);

            // Verify there is only one option in the sidebar
            const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            const lastChatHintText = TestHelper.translateLocal('accessibilityHints.lastChatMessagePreview');
            const lastChatText = screen.queryByLabelText(lastChatHintText);

            return waitFor(() => expect(lastChatText?.props?.children).toBe('B: Test'));
        }));

    it('Should sort the names before displaying', () =>
        signInAndGetApp('', [USER_E_ACCOUNT_ID, ...participantAccountIDs4]).then(() => {
            // Verify the sidebar links are rendered
            const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
            const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);

            // Verify there is only one option in the sidebar
            const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            const displayNameHintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
            const displayNameText = screen.queryByLabelText(displayNameHintText);

            return waitFor(() => expect(displayNameText?.props?.children?.[0]).toBe('A, B, C, D, E'));
        }));
});
