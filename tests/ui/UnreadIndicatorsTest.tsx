/* eslint-disable @typescript-eslint/naming-convention */
import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {addSeconds, format, subMinutes, subSeconds} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';
import React from 'react';
import {AppState, DeviceEventEmitter} from 'react-native';
import type {TextStyle, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import {setSidebarLoaded} from '@libs/actions/App';
import {trackExpense} from '@libs/actions/IOU';
import {addComment, deleteReportComment, markCommentAsUnread, readNewestAction} from '@libs/actions/Report';
import {subscribeToUserEvents} from '@libs/actions/User';
import {lastItem} from '@libs/CollectionUtils';
import DateUtils from '@libs/DateUtils';
import LocalNotification from '@libs/Notification/LocalNotification';
import {rand64} from '@libs/NumberUtils';
import {getReportActionText} from '@libs/ReportActionsUtils';
import FontUtils from '@styles/utils/FontUtils';
import App from '@src/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import {navigateToSidebarOption} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(120000);

jest.mock('@react-navigation/native');
jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');
jest.mock('../../src/components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators', () => jest.fn());

TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();

let hasRenderedApp = false;

beforeEach(() => {
    Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
});

afterEach(() => {
    hasRenderedApp = false;
});

function scrollUpToRevealNewMessagesBadge() {
    const hintText = TestHelper.translateLocal('sidebarScreen.listOfChatMessages');
    fireEvent.scroll(screen.getByLabelText(hintText), {
        nativeEvent: {
            contentOffset: {
                y: 250,
            },
            contentSize: {
                // Dimensions of the scrollable content
                height: 500,
                width: 100,
            },
            layoutMeasurement: {
                // Dimensions of the device
                height: 700,
                width: 300,
            },
        },
    });
}

function isNewMessagesBadgeVisible(): boolean {
    const hintText = TestHelper.translateLocal('accessibilityHints.scrollToNewestMessages');
    const badge = screen.queryByAccessibilityHint(hintText);
    const badgeProps = badge?.props as {style: ViewStyle};
    const transformStyle = badgeProps.style.transform?.[0] as {translateY: number};

    return Math.round(transformStyle.translateY) === -40;
}

function navigateToSidebar(): Promise<void> {
    const hintText = TestHelper.translateLocal('accessibilityHints.navigateToChatsList');
    const reportHeaderBackButton = screen.queryByAccessibilityHint(hintText);
    if (reportHeaderBackButton) {
        fireEvent(reportHeaderBackButton, 'press');
    }
    return waitForBatchedUpdates();
}

function areYouOnChatListScreen(): boolean {
    const hintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
    const sidebarLinks = screen.queryAllByLabelText(hintText, {includeHiddenElements: true});

    return !sidebarLinks?.at(0)?.props?.accessibilityElementsHidden;
}

const REPORT_ID = '1';
const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';
const USER_B_ACCOUNT_ID = 2;
const USER_B_EMAIL = 'user_b@test.com';
const USER_C_ACCOUNT_ID = 3;
const USER_C_EMAIL = 'user_c@test.com';
const TEST_AUTH_TOKEN = 'test-auth-token';
const TEST_AUTO_GENERATED_LOGIN = 'expensify.cash-abc123';
let reportAction3CreatedDate: string;
let reportAction9CreatedDate: string;
const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
const createdReportActionID = rand64().toString();
const createdReportAction = {
    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
    automatic: false,
    created: format(TEN_MINUTES_AGO, CONST.DATE.FNS_DB_FORMAT_STRING),
    reportActionID: createdReportActionID,
    message: [
        {
            style: 'strong',
            text: '__FAKE__',
            type: 'TEXT',
        },
        {
            style: 'normal',
            text: 'created this report',
            type: 'TEXT',
        },
    ],
};

function renderAppOnce() {
    if (hasRenderedApp) {
        return;
    }
    render(<App />);
    hasRenderedApp = true;
}

async function fastSignInWithTestUser() {
    await Onyx.multiSet({
        [ONYXKEYS.CREDENTIALS]: {
            login: USER_A_EMAIL,
            autoGeneratedLogin: TEST_AUTO_GENERATED_LOGIN,
            autoGeneratedPassword: 'Password1',
        },
        [ONYXKEYS.ACCOUNT]: {
            validated: true,
            isUsingExpensifyCard: false,
        },
        [ONYXKEYS.SESSION]: {
            authToken: TEST_AUTH_TOKEN,
            accountID: USER_A_ACCOUNT_ID,
            email: USER_A_EMAIL,
            encryptedAuthToken: TEST_AUTH_TOKEN,
        },
        [ONYXKEYS.BETAS]: ['all'],
        [ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID]: 'randomID',
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
            [USER_A_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_A_EMAIL, USER_A_ACCOUNT_ID, 'A'),
        },
    });
    await waitForBatchedUpdates();
}

/**
 * Sets up a test with a logged in user that has one unread chat from another user. Returns the <App/> test instance.
 */
async function signInAndGetAppWithUnreadChat(): Promise<void> {
    await fastSignInWithTestUser();

    // Render the App and ensure initial navigation state settles.
    renderAppOnce();
    await waitForBatchedUpdatesWithAct();

    subscribeToUserEvents();

    await waitForBatchedUpdates();

    reportAction3CreatedDate = format(addSeconds(TEN_MINUTES_AGO, 30), CONST.DATE.FNS_DB_FORMAT_STRING);
    reportAction9CreatedDate = format(addSeconds(TEN_MINUTES_AGO, 90), CONST.DATE.FNS_DB_FORMAT_STRING);

    const personalDetails = {
        [USER_B_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
    };

    const report = {
        reportID: REPORT_ID,
        reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
        lastReadTime: reportAction3CreatedDate,
        lastVisibleActionCreated: reportAction9CreatedDate,
        lastMessageText: 'Test',
        participants: {
            [USER_B_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [USER_A_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        },
        lastActorAccountID: USER_B_ACCOUNT_ID,
        type: CONST.REPORT.TYPE.CHAT,
    };

    const reportActions = {
        [createdReportActionID]: createdReportAction,
        1: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '1'),
        2: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 20), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '2'),
        3: TestHelper.buildTestReportComment(reportAction3CreatedDate, USER_B_ACCOUNT_ID, '3'),
        4: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 40), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '4'),
        5: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 50), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '5'),
        6: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 60), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '6'),
        7: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 70), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '7'),
        8: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 80), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '8'),
        9: TestHelper.buildTestReportComment(reportAction9CreatedDate, USER_B_ACCOUNT_ID, '9'),
    };

    await Promise.all([
        Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails),
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report),
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, reportActions),
    ]);

    // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
    setSidebarLoaded();
    await waitForBatchedUpdatesWithAct();
}

describe('Unread Indicators', () => {
    beforeAll(() => {
        PusherHelper.setup();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        hasRenderedApp = false;

        global.fetch = TestHelper.getGlobalFetchMock();
        // Unsubscribe to pusher channels
        PusherHelper.teardown();

        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('Display bold in the LHN for unread chat and new line indicator above the chat message when we navigate to it', () =>
        signInAndGetAppWithUnreadChat()
            .then(() => {
                // Verify no notifications are created for these older messages
                expect((LocalNotification.showCommentNotification as jest.Mock).mock.calls).toHaveLength(0);

                // Verify the sidebar links are rendered
                const sidebarLinksHintText = TestHelper.translateLocal('sidebarScreen.listOfChats');
                const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
                expect(sidebarLinks).toHaveLength(1);

                // Verify there is only one option in the sidebar
                const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
                expect(optionRows).toHaveLength(1);

                // And that the text is bold
                const displayNameHintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameText = screen.queryByLabelText(displayNameHintText);
                expect((displayNameText?.props?.style as TextStyle)?.fontWeight).toBe(FontUtils.fontWeight.bold);

                return navigateToSidebarOption(0);
            })
            .then(async () => {
                act(() => (NativeNavigation as NativeNavigationMock).triggerTransitionEnd());

                // That the report actions are visible along with the created action
                const welcomeMessageHintText = TestHelper.translateLocal('accessibilityHints.chatWelcomeMessage');
                const createdAction = screen.queryByLabelText(welcomeMessageHintText);
                expect(createdAction).toBeTruthy();
                const reportCommentsHintText = TestHelper.translateLocal('accessibilityHints.chatMessage');
                const reportComments = screen.queryAllByLabelText(reportCommentsHintText);
                expect(reportComments).toHaveLength(9);
                // Since the last read timestamp is the timestamp of action 3 we should have an unread indicator above the next "unread" action which will
                // have actionID of 4
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
                const reportActionID = unreadIndicator.at(0)?.props?.['data-action-id'] as string;
                expect(reportActionID).toBe('4');
                // Scroll up and verify that the "New messages" badge appears
                scrollUpToRevealNewMessagesBadge();
                return waitFor(() => expect(isNewMessagesBadgeVisible()).toBe(true));
            }));
    it('Clear the new line indicator and bold when we navigate away from a chat that is now read', () =>
        signInAndGetAppWithUnreadChat()
            // Navigate to the unread chat from the sidebar
            .then(() => navigateToSidebarOption(0))
            .then(() => {
                act(() => (NativeNavigation as NativeNavigationMock).triggerTransitionEnd());
                // Verify the unread indicator is present
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
            })
            .then(() => {
                expect(areYouOnChatListScreen()).toBe(false);
                // Then navigate back to the sidebar
                return navigateToSidebar();
            })
            .then(() => {
                // Verify the LHN is now open
                expect(areYouOnChatListScreen()).toBe(true);

                // Tap on the chat again
                return navigateToSidebarOption(0);
            })
            .then(() => {
                // Sending event to clear the unread indicator cache, given that the test doesn't behave as the app
                DeviceEventEmitter.emit(`unreadAction_${REPORT_ID}`, format(new Date(), CONST.DATE.FNS_DB_FORMAT_STRING));
                return waitForBatchedUpdatesWithAct();
            })
            .then(() => {
                // Verify the unread indicator is not present
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(0);
                // Tap on the chat again
                return navigateToSidebarOption(0);
            })
            .then(() => {
                // Verify the unread indicator is not present
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(0);
                expect(areYouOnChatListScreen()).toBe(false);
            }));
    it('Shows a browser notification and bold text when a new message arrives for a chat that is read', () =>
        signInAndGetAppWithUnreadChat()
            .then(() => {
                // Simulate a new report arriving via Pusher along with reportActions and personalDetails for the other participant
                // We set the created date 5 seconds in the past to ensure that time has passed when we open the report
                const NEW_REPORT_ID = '2';
                const NEW_REPORT_CREATED_DATE = subSeconds(new Date(), 5);
                const NEW_REPORT_FIST_MESSAGE_CREATED_DATE = addSeconds(NEW_REPORT_CREATED_DATE, 1);
                const createdReportActionIDLocal = rand64();
                const commentReportActionID = rand64();
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${NEW_REPORT_ID}`,
                        value: {
                            reportID: NEW_REPORT_ID,
                            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                            lastReadTime: '',
                            lastVisibleActionCreated: DateUtils.getDBTime(toZonedTime(NEW_REPORT_FIST_MESSAGE_CREATED_DATE, 'UTC').valueOf()),
                            lastMessageText: 'Comment 1',
                            lastActorAccountID: USER_C_ACCOUNT_ID,
                            participants: {
                                [USER_C_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                                [USER_A_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                            },
                            type: CONST.REPORT.TYPE.CHAT,
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${NEW_REPORT_ID}`,
                        value: {
                            [createdReportActionIDLocal]: {
                                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                                automatic: false,
                                created: format(NEW_REPORT_CREATED_DATE, CONST.DATE.FNS_DB_FORMAT_STRING),
                                reportActionID: createdReportActionIDLocal,
                            },
                            [commentReportActionID]: {
                                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                                actorAccountID: USER_C_ACCOUNT_ID,
                                person: [{type: 'TEXT', style: 'strong', text: 'User C'}],
                                created: format(NEW_REPORT_FIST_MESSAGE_CREATED_DATE, CONST.DATE.FNS_DB_FORMAT_STRING),
                                message: [{type: 'COMMENT', html: 'Comment 1', text: 'Comment 1'}],
                                reportActionID: commentReportActionID,
                            },
                        },
                        shouldNotify: true,
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {
                            [USER_C_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_C_EMAIL, USER_C_ACCOUNT_ID, 'C'),
                        },
                    },
                ]);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Verify notification was created
                expect(LocalNotification.showCommentNotification).toHaveBeenCalled();
            })
            .then(() => {
                // // Verify the new report option appears in the LHN
                const optionRows = screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
                expect(optionRows).toHaveLength(2);
                // Verify the text for both chats are bold indicating that nothing has not yet been read
                const displayNameHintTexts = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(displayNameHintTexts);
                expect(displayNameTexts).toHaveLength(2);
                const firstReportOption = displayNameTexts.at(0);
                expect((firstReportOption?.props?.style as TextStyle)?.fontWeight).toBe(FontUtils.fontWeight.bold);
                expect(screen.getByText('B User')).toBeOnTheScreen();

                const secondReportOption = displayNameTexts.at(1);
                expect((secondReportOption?.props?.style as TextStyle)?.fontWeight).toBe(FontUtils.fontWeight.bold);
                expect(screen.getByText('C User')).toBeOnTheScreen();

                // Tap the new report option and navigate back to the sidebar again via the back button
                return navigateToSidebarOption(0);
            })
            .then(waitForBatchedUpdates)
            .then(() => {
                act(() => (NativeNavigation as NativeNavigationMock).triggerTransitionEnd());
                // Verify that report we navigated to appears in a "read" state while the original unread report still shows as unread
                const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(hintText, {includeHiddenElements: true});
                expect(displayNameTexts).toHaveLength(2);
                expect((displayNameTexts.at(0)?.props?.style as TextStyle)?.fontWeight).toBe(FontUtils.fontWeight.normal);
                expect(screen.getAllByText('B User').at(0)).toBeOnTheScreen();
                expect((displayNameTexts.at(1)?.props?.style as TextStyle)?.fontWeight).toBe(FontUtils.fontWeight.bold);
                expect(screen.getByText('C User', {includeHiddenElements: true})).toBeOnTheScreen();
            }));

    xit('Manually marking a chat message as unread shows the new line indicator and updates the LHN', () =>
        signInAndGetAppWithUnreadChat()
            // Navigate to the unread report
            .then(() => navigateToSidebarOption(0))
            .then(() => {
                // It's difficult to trigger marking a report comment as unread since we would have to mock the long press event and then
                // another press on the context menu item so we will do it via the action directly and then test if the UI has updated properly
                markCommentAsUnread(REPORT_ID, createdReportAction, USER_A_ACCOUNT_ID);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Verify the indicator appears above the last action
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
                const reportActionID = unreadIndicator.at(0)?.props?.['data-action-id'] as string;
                expect(reportActionID).toBe('3');
                // Scroll up and verify the new messages badge appears
                scrollUpToRevealNewMessagesBadge();
                return waitFor(() => expect(isNewMessagesBadgeVisible()).toBe(true));
            })
            // Navigate to the sidebar
            .then(navigateToSidebar)
            .then(() => {
                // Verify the report is marked as unread in the sidebar
                const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(hintText);
                expect(displayNameTexts).toHaveLength(1);
                expect((displayNameTexts.at(0)?.props?.style as TextStyle)?.fontWeight).toBe(FontUtils.fontWeight.bold);
                expect(screen.getByText('B User')).toBeOnTheScreen();

                // Navigate to the report again and back to the sidebar
                return navigateToSidebarOption(0);
            })
            .then(() => navigateToSidebar())
            .then(() => {
                // Verify the report is now marked as read
                const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(hintText);
                expect(displayNameTexts).toHaveLength(1);
                expect((displayNameTexts.at(0)?.props?.style as TextStyle)?.fontWeight).toBe(undefined);
                expect(screen.getByText('B User')).toBeOnTheScreen();

                // Navigate to the report again and verify the new line indicator is missing
                return navigateToSidebarOption(0);
            })
            .then(() => {
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(0);

                // Scroll up and verify the "New messages" badge is hidden
                scrollUpToRevealNewMessagesBadge();
                return waitFor(() => expect(isNewMessagesBadgeVisible()).toBe(false));
            }));

    it('Keep showing the new line indicator when a new message is created by the current user', () =>
        signInAndGetAppWithUnreadChat()
            .then(() => {
                // Verify we are on the LHN and that the chat shows as unread in the LHN
                expect(areYouOnChatListScreen()).toBe(true);

                // Navigate to the report and verify the indicator is present
                return navigateToSidebarOption(0);
            })
            .then(async () => {
                act(() => (NativeNavigation as NativeNavigationMock).triggerTransitionEnd());
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);

                // Leave a comment as the current user and verify the indicator is removed
                const report = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`);
                addComment(report, REPORT_ID, [], 'Current User Comment 1', CONST.DEFAULT_TIME_ZONE);
                return waitForBatchedUpdates();
            })
            .then(() => {
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
            }));

    xit('Keeps the new line indicator when the user moves the App to the background', () =>
        signInAndGetAppWithUnreadChat()
            .then(() => {
                // Verify we are on the LHN and that the chat shows as unread in the LHN
                expect(areYouOnChatListScreen()).toBe(true);

                // Navigate to the chat and verify the new line indicator is present
                return navigateToSidebarOption(0);
            })
            .then(() => {
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);

                // Then back to the LHN - then back to the chat again and verify the new line indicator has cleared
                return navigateToSidebar();
            })
            .then(() => navigateToSidebarOption(0))
            .then(() => {
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(0);

                // Mark a previous comment as unread and verify the unread action indicator returns
                markCommentAsUnread(REPORT_ID, createdReportAction, USER_A_ACCOUNT_ID);
                return waitForBatchedUpdates();
            })
            .then(() => {
                const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
                let unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);

                // Trigger the app going inactive and active again
                AppState.emitCurrentTestState('background');
                AppState.emitCurrentTestState('active');

                // Verify the new line is still present
                unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
            }));

    it('Displays the correct chat message preview in the LHN when a comment is added then deleted', () => {
        let reportActions: OnyxEntry<ReportActions>;
        let lastReportAction: ReportAction | undefined;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val),
        });
        return (
            signInAndGetAppWithUnreadChat()
                // Navigate to the chat and simulate leaving a comment from the current user
                .then(() => navigateToSidebarOption(0))
                .then(async () => {
                    const report = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`);
                    // Leave a comment as the current user
                    addComment(report, REPORT_ID, [], 'Current User Comment 1', CONST.DEFAULT_TIME_ZONE);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // Simulate the response from the server so that the comment can be deleted in this test
                    lastReportAction = reportActions ? lastItem(reportActions) : undefined;
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                        lastMessageText: getReportActionText(lastReportAction),
                        lastActorAccountID: lastReportAction?.actorAccountID,
                        reportID: REPORT_ID,
                    });
                    return waitForBatchedUpdates();
                })
                .then(async () => {
                    // Verify the chat preview text matches the last comment from the current user
                    const hintText = TestHelper.translateLocal('accessibilityHints.lastChatMessagePreview');
                    const alternateText = screen.queryAllByLabelText(hintText, {includeHiddenElements: true});
                    expect(alternateText).toHaveLength(1);

                    // This message is visible on the sidebar and the report screen, so there are two occurrences.
                    expect(screen.getAllByText('Current User Comment 1').at(0)).toBeOnTheScreen();

                    const report = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`);
                    if (lastReportAction) {
                        deleteReportComment(report, lastReportAction, [], undefined, undefined, '');
                    }
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    const hintText = TestHelper.translateLocal('accessibilityHints.lastChatMessagePreview');
                    const alternateText = screen.queryAllByLabelText(hintText, {includeHiddenElements: true});
                    expect(alternateText).toHaveLength(1);
                    expect(screen.getAllByText('Comment 9').at(0)).toBeOnTheScreen();
                })
        );
    });

    it('Move the new line indicator to the next message when the unread message is deleted', async () => {
        let reportActions: OnyxEntry<ReportActions>;
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val),
        });
        await signInAndGetAppWithUnreadChat();
        await navigateToSidebarOption(0);

        const report = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`);
        addComment(report, REPORT_ID, [], 'Comment 1', CONST.DEFAULT_TIME_ZONE);

        await waitForBatchedUpdates();

        const firstNewReportAction = reportActions ? lastItem(reportActions) : undefined;

        if (firstNewReportAction) {
            markCommentAsUnread(REPORT_ID, firstNewReportAction, USER_A_ACCOUNT_ID);

            await waitForBatchedUpdates();

            addComment(report, REPORT_ID, [], 'Comment 2', CONST.DEFAULT_TIME_ZONE);

            await waitForBatchedUpdates();

            deleteReportComment(report, firstNewReportAction, [], undefined, undefined, '');

            await waitForBatchedUpdates();
        }

        const secondNewReportAction = reportActions ? lastItem(reportActions) : undefined;
        const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
        const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
        expect(unreadIndicator).toHaveLength(1);
        const reportActionID = unreadIndicator.at(0)?.props?.['data-action-id'] as string;
        expect(reportActionID).toBe(secondNewReportAction?.reportActionID);

        Onyx.disconnect(connection);
    });

    it('Do not display the new line indicator when receiving a new message from another user', async () => {
        // Given a read report
        await signInAndGetAppWithUnreadChat();

        readNewestAction(REPORT_ID, true);

        await waitForBatchedUpdates();

        await navigateToSidebarOption(0);

        // When another user adds a new message
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            10: TestHelper.buildTestReportComment(DateUtils.getDBTime(), USER_B_ACCOUNT_ID, '10'),
        });

        // Then the new line indicator shouldn't be displayed
        const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
        const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
        expect(unreadIndicator).toHaveLength(0);
    });

    it('Do not display the new line indicator when tracking an expense on self DM while offline', async () => {
        // Given a self DM report and an offline network
        await signInAndGetAppWithUnreadChat();
        await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: true});
        // Remove unnecessary report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, null);

        const selfDMReport = {
            ...createRandomReport(2, CONST.REPORT.CHAT_TYPE.SELF_DM),
            type: CONST.REPORT.TYPE.CHAT,
            lastMessageText: 'test',
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`, {
            1: {
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                automatic: false,
                created: DateUtils.getDBTime(),
                reportActionID: '1',
                message: [
                    {
                        style: 'strong',
                        text: '__FAKE__',
                        type: 'TEXT',
                    },
                    {
                        style: 'normal',
                        text: 'created this report',
                        type: 'TEXT',
                    },
                ],
            },
        });

        await navigateToSidebarOption(0);

        const fakeTransaction = {
            ...createRandomTransaction(1),
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            comment: 'description',
        };

        // When the user track an expense on the self DM
        const participant = {login: USER_A_EMAIL, accountID: USER_A_ACCOUNT_ID};
        trackExpense({
            report: selfDMReport,
            isDraftPolicy: true,
            action: CONST.IOU.ACTION.CREATE,
            participantParams: {
                payeeEmail: participant.login,
                payeeAccountID: participant.accountID,
                participant,
            },
            transactionParams: {
                amount: fakeTransaction.amount,
                currency: fakeTransaction.currency,
                created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
            },
            isASAPSubmitBetaEnabled: true,
            currentUserAccountIDParam: USER_A_ACCOUNT_ID,
            currentUserEmailParam: USER_A_EMAIL,
            introSelected: undefined,
            activePolicyID: undefined,
            quickAction: undefined,
        });
        await waitForBatchedUpdates();

        // Then the new line indicator shouldn't be displayed
        const newMessageLineIndicatorHintText = TestHelper.translateLocal('accessibilityHints.newMessageLineIndicator');
        const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
        expect(unreadIndicator).toHaveLength(0);
    });
    it('Mark the chat as unread on clicking "Mark as unread" on an item in LHN when the last message of the chat was deleted by another user', async () => {
        await signInAndGetAppWithUnreadChat();

        await navigateToSidebar();

        const reportAction11CreatedDate = format(addSeconds(TEN_MINUTES_AGO, 110), CONST.DATE.FNS_DB_FORMAT_STRING);
        const reportAction11 = TestHelper.buildTestReportComment(reportAction11CreatedDate, USER_B_ACCOUNT_ID, '11');
        const reportAction12CreatedDate = format(addSeconds(TEN_MINUTES_AGO, 120), CONST.DATE.FNS_DB_FORMAT_STRING);
        const reportAction12 = TestHelper.buildTestReportComment(reportAction12CreatedDate, USER_B_ACCOUNT_ID, '12');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            11: reportAction11,
            12: reportAction12,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            lastVisibleActionCreated: reportAction12CreatedDate,
        });

        const message = reportAction12.message.at(0);
        if (message) {
            message.html = ''; // Simulate the server response for deleting the last message
        }

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            lastVisibleActionCreated: reportAction11CreatedDate,
        });

        markCommentAsUnread(REPORT_ID, {reportActionID: -1} as unknown as ReportAction, USER_A_ACCOUNT_ID); // Marking the chat as unread from LHN passing a dummy reportActionID

        await waitForBatchedUpdates();
        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
        const displayNameTexts = screen.queryAllByLabelText(hintText);
        expect(displayNameTexts).toHaveLength(1);
        expect((displayNameTexts.at(0)?.props?.style as TextStyle)?.fontWeight).toBe(FontUtils.fontWeight.bold);
    });

    it('Mark the last comment as unread should set lastReadTime to the last action’s creation time', async () => {
        await signInAndGetAppWithUnreadChat();
        await navigateToSidebarOption(0);

        const report = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`);

        // When USER_A add a comment
        addComment(report, REPORT_ID, [], 'Current User Comment', CONST.DEFAULT_TIME_ZONE);
        await waitForBatchedUpdates();

        // Then USER_A mark the report as unread
        markCommentAsUnread(REPORT_ID, {reportActionID: -1} as unknown as ReportAction, USER_A_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the lastReadTime of report should same as last action from USER_B
        const updatedReport = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`);
        expect(updatedReport?.lastReadTime).toBe(DateUtils.subtractMillisecondsFromDateTime(reportAction9CreatedDate, 1));
    });
});
