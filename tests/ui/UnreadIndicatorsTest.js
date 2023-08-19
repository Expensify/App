import React from 'react';
import Onyx from 'react-native-onyx';
import {Linking, AppState} from 'react-native';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import lodashGet from 'lodash/get';
import moment from 'moment';
import App from '../../src/App';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import waitForPromisesToResolveWithAct from '../utils/waitForPromisesToResolveWithAct';
import * as TestHelper from '../utils/TestHelper';
import appSetup from '../../src/setup';
import fontWeightBold from '../../src/styles/fontWeight/bold';
import * as AppActions from '../../src/libs/actions/App';
import * as NumberUtils from '../../src/libs/NumberUtils';
import LocalNotification from '../../src/libs/Notification/LocalNotification';
import * as Report from '../../src/libs/actions/Report';
import * as CollectionUtils from '../../src/libs/CollectionUtils';
import DateUtils from '../../src/libs/DateUtils';
import * as User from '../../src/libs/actions/User';
import * as Pusher from '../../src/libs/Pusher/pusher';
import PusherConnectionManager from '../../src/libs/PusherConnectionManager';
import CONFIG from '../../src/CONFIG';
import * as Localize from '../../src/libs/Localize';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(30000);

jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');

beforeAll(() => {
    // In this test, we are generically mocking the responses of all API requests by mocking fetch() and having it
    // return 200. In other tests, we might mock HttpUtils.xhr() with a more specific mock data response (which means
    // fetch() never gets called so it does not need mocking) or we might have fetch throw an error to test error handling
    // behavior. But here we just want to treat all API requests as a generic "success" and in the cases where we need to
    // simulate data arriving we will just set it into Onyx directly with Onyx.merge() or Onyx.set() etc.
    global.fetch = TestHelper.getGlobalFetchMock();

    Linking.setInitialURL('https://new.expensify.com/');
    appSetup();

    // Connect to Pusher
    PusherConnectionManager.init();
    Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api?command=AuthenticatePusher`,
    });
});

function scrollUpToRevealNewMessagesBadge() {
    const hintText = Localize.translateLocal('sidebarScreen.listOfChatMessages');
    fireEvent.scroll(screen.queryByLabelText(hintText), {
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

/**
 * @return {Boolean}
 */
function isNewMessagesBadgeVisible() {
    const hintText = Localize.translateLocal('accessibilityHints.scrollToNewestMessages');
    const badge = screen.queryByAccessibilityHint(hintText);
    return Math.round(badge.props.style.transform[0].translateY) === 10;
}

/**
 * @return {Promise}
 */
function navigateToSidebar() {
    const hintText = Localize.translateLocal('accessibilityHints.navigateToChatsList');
    const reportHeaderBackButton = screen.queryByAccessibilityHint(hintText);
    fireEvent(reportHeaderBackButton, 'press');
    return waitForPromisesToResolve();
}

/**
 * @param {Number} index
 * @return {Promise}
 */
function navigateToSidebarOption(index) {
    const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
    const optionRows = screen.queryAllByAccessibilityHint(hintText);
    fireEvent(optionRows[index], 'press');
    return waitForPromisesToResolve();
}

/**
 * @return {Boolean}
 */
function areYouOnChatListScreen() {
    const hintText = Localize.translateLocal('sidebarScreen.listOfChats');
    const sidebarLinks = screen.queryAllByLabelText(hintText);
    return !lodashGet(sidebarLinks, [0, 'props', 'accessibilityElementsHidden']);
}

const REPORT_ID = '1';
const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';
const USER_B_ACCOUNT_ID = 2;
const USER_B_EMAIL = 'user_b@test.com';
const USER_C_ACCOUNT_ID = 3;
const USER_C_EMAIL = 'user_c@test.com';
const MOMENT_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';
let reportAction3CreatedDate;
let reportAction9CreatedDate;

/**
 * Sets up a test with a logged in user that has one unread chat from another user. Returns the <App/> test instance.
 *
 * @returns {Promise}
 */
function signInAndGetAppWithUnreadChat() {
    // Render the App and sign in as a test user.
    render(<App />);
    return waitForPromisesToResolveWithAct()
        .then(() => {
            const hintText = Localize.translateLocal('loginForm.loginForm');
            const loginForm = screen.queryAllByLabelText(hintText);
            expect(loginForm).toHaveLength(1);

            return TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A');
        })
        .then(() => {
            User.subscribeToUserEvents();
            return waitForPromisesToResolve();
        })
        .then(() => {
            const MOMENT_TEN_MINUTES_AGO = moment().subtract(10, 'minutes');
            reportAction3CreatedDate = MOMENT_TEN_MINUTES_AGO.clone().add(30, 'seconds').format(MOMENT_FORMAT);
            reportAction9CreatedDate = MOMENT_TEN_MINUTES_AGO.clone().add(90, 'seconds').format(MOMENT_FORMAT);

            // Simulate setting an unread report and personal details
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                reportID: REPORT_ID,
                reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                lastReadTime: reportAction3CreatedDate,
                lastVisibleActionCreated: reportAction9CreatedDate,
                lastMessageText: 'Test',
                participantAccountIDs: [USER_B_ACCOUNT_ID],
                type: CONST.REPORT.TYPE.CHAT,
            });
            const createdReportActionID = NumberUtils.rand64();
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [createdReportActionID]: {
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    automatic: false,
                    created: MOMENT_TEN_MINUTES_AGO.clone().format(MOMENT_FORMAT),
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
                },
                1: TestHelper.buildTestReportComment(MOMENT_TEN_MINUTES_AGO.clone().add(10, 'seconds').format(MOMENT_FORMAT), USER_B_ACCOUNT_ID, '1'),
                2: TestHelper.buildTestReportComment(MOMENT_TEN_MINUTES_AGO.clone().add(20, 'seconds').format(MOMENT_FORMAT), USER_B_ACCOUNT_ID, '2'),
                3: TestHelper.buildTestReportComment(reportAction3CreatedDate, USER_B_ACCOUNT_ID, '3'),
                4: TestHelper.buildTestReportComment(MOMENT_TEN_MINUTES_AGO.clone().add(40, 'seconds').format(MOMENT_FORMAT), USER_B_ACCOUNT_ID, '4'),
                5: TestHelper.buildTestReportComment(MOMENT_TEN_MINUTES_AGO.clone().add(50, 'seconds').format(MOMENT_FORMAT), USER_B_ACCOUNT_ID, '5'),
                6: TestHelper.buildTestReportComment(MOMENT_TEN_MINUTES_AGO.clone().add(60, 'seconds').format(MOMENT_FORMAT), USER_B_ACCOUNT_ID, '6'),
                7: TestHelper.buildTestReportComment(MOMENT_TEN_MINUTES_AGO.clone().add(70, 'seconds').format(MOMENT_FORMAT), USER_B_ACCOUNT_ID, '7'),
                8: TestHelper.buildTestReportComment(MOMENT_TEN_MINUTES_AGO.clone().add(80, 'seconds').format(MOMENT_FORMAT), USER_B_ACCOUNT_ID, '8'),
                9: TestHelper.buildTestReportComment(reportAction9CreatedDate, USER_B_ACCOUNT_ID, '9'),
            });
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [USER_B_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
            });

            // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
            AppActions.setSidebarLoaded(true);
            return waitForPromisesToResolve();
        });
}

describe('Unread Indicators', () => {
    afterEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
    });

    it('Display bold in the LHN for unread chat and new line indicator above the chat message when we navigate to it', () =>
        signInAndGetAppWithUnreadChat()
            .then(() => {
                // Verify no notifications are created for these older messages
                expect(LocalNotification.showCommentNotification.mock.calls).toHaveLength(0);

                // Verify the sidebar links are rendered
                const sidebarLinksHintText = Localize.translateLocal('sidebarScreen.listOfChats');
                const sidebarLinks = screen.queryAllByLabelText(sidebarLinksHintText);
                expect(sidebarLinks).toHaveLength(1);

                // Verify there is only one option in the sidebar
                const optionRowsHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                const optionRows = screen.queryAllByAccessibilityHint(optionRowsHintText);
                expect(optionRows).toHaveLength(1);

                // And that the text is bold
                const displayNameHintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameText = screen.queryByLabelText(displayNameHintText);
                expect(lodashGet(displayNameText, ['props', 'style', 0, 'fontWeight'])).toBe(fontWeightBold);

                return navigateToSidebarOption(0);
            })
            .then(() => {
                // That the report actions are visible along with the created action
                const welcomeMessageHintText = Localize.translateLocal('accessibilityHints.chatWelcomeMessage');
                const createdAction = screen.queryByLabelText(welcomeMessageHintText);
                expect(createdAction).toBeTruthy();
                const reportCommentsHintText = Localize.translateLocal('accessibilityHints.chatMessage');
                const reportComments = screen.queryAllByLabelText(reportCommentsHintText);
                expect(reportComments).toHaveLength(9);

                // Since the last read timestamp is the timestamp of action 3 we should have an unread indicator above the next "unread" action which will
                // have actionID of 4
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
                const reportActionID = lodashGet(unreadIndicator, [0, 'props', 'data-action-id']);
                expect(reportActionID).toBe('4');

                // Scroll up and verify that the "New messages" badge appears
                scrollUpToRevealNewMessagesBadge();
                return waitFor(() => expect(isNewMessagesBadgeVisible()).toBe(true));
            }));

    it('Clear the new line indicator and bold when we navigate away from a chat that is now read', () =>
        signInAndGetAppWithUnreadChat()
            // Navigate to the unread chat from the sidebar
            .then(() => navigateToSidebarOption(0))
            // Navigate to the unread chat from the sidebar
            .then(() => navigateToSidebarOption(0))
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
                // Verify the unread indicator is not present
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(0);

                // Tap on the chat again
                return navigateToSidebarOption(0);
            })
            .then(() => {
                // Verify the unread indicator is not present
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(0);
                expect(areYouOnChatListScreen()).toBe(false);
            }));

    it('Shows a browser notification and bold text when a new message arrives for a chat that is read', () =>
        signInAndGetAppWithUnreadChat()
            .then(() => {
                // Simulate a new report arriving via Pusher along with reportActions and personalDetails for the other participant
                // We set the created moment 5 seconds in the past to ensure that time has passed when we open the report
                const NEW_REPORT_ID = '2';
                const NEW_REPORT_CREATED_MOMENT = moment().subtract(5, 'seconds');
                const NEW_REPORT_FIST_MESSAGE_CREATED_MOMENT = NEW_REPORT_CREATED_MOMENT.add(1, 'seconds');

                const createdReportActionID = NumberUtils.rand64();
                const commentReportActionID = NumberUtils.rand64();
                const channel = Pusher.getChannel(`${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}${USER_A_ACCOUNT_ID}${CONFIG.PUSHER.SUFFIX}`);
                channel.emit(Pusher.TYPE.MULTIPLE_EVENTS, [
                    {
                        eventType: Pusher.TYPE.MULTIPLE_EVENT_TYPE.ONYX_API_UPDATE,
                        data: [
                            {
                                onyxMethod: Onyx.METHOD.MERGE,
                                key: `${ONYXKEYS.COLLECTION.REPORT}${NEW_REPORT_ID}`,
                                value: {
                                    reportID: NEW_REPORT_ID,
                                    reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                                    lastReadTime: '',
                                    lastVisibleActionCreated: DateUtils.getDBTime(NEW_REPORT_FIST_MESSAGE_CREATED_MOMENT.utc().valueOf()),
                                    lastMessageText: 'Comment 1',
                                    participantAccountIDs: [USER_C_ACCOUNT_ID],
                                },
                            },
                            {
                                onyxMethod: Onyx.METHOD.MERGE,
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${NEW_REPORT_ID}`,
                                value: {
                                    [createdReportActionID]: {
                                        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                                        automatic: false,
                                        created: NEW_REPORT_CREATED_MOMENT.format(MOMENT_FORMAT),
                                        reportActionID: createdReportActionID,
                                    },
                                    [commentReportActionID]: {
                                        actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                                        actorAccountID: USER_C_ACCOUNT_ID,
                                        person: [{type: 'TEXT', style: 'strong', text: 'User C'}],
                                        created: NEW_REPORT_FIST_MESSAGE_CREATED_MOMENT.format(MOMENT_FORMAT),
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
                        ],
                    },
                ]);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Verify notification was created
                expect(LocalNotification.showCommentNotification).toBeCalled();
            })
            .then(() => {
                // // Verify the new report option appears in the LHN
                const optionRowsHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                const optionRows = screen.queryAllByAccessibilityHint(optionRowsHintText);
                expect(optionRows).toHaveLength(2);

                // Verify the text for both chats are bold indicating that nothing has not yet been read
                const displayNameHintTexts = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(displayNameHintTexts);
                expect(displayNameTexts).toHaveLength(2);
                const firstReportOption = displayNameTexts[0];
                expect(lodashGet(firstReportOption, ['props', 'style', 0, 'fontWeight'])).toBe(fontWeightBold);
                expect(lodashGet(firstReportOption, ['props', 'children'])).toBe('C User');

                const secondReportOption = displayNameTexts[1];
                expect(lodashGet(secondReportOption, ['props', 'style', 0, 'fontWeight'])).toBe(fontWeightBold);
                expect(lodashGet(secondReportOption, ['props', 'children'])).toBe('B User');

                // Tap the new report option and navigate back to the sidebar again via the back button
                return navigateToSidebarOption(0);
            })
            .then(() => {
                // Verify that report we navigated to appears in a "read" state while the original unread report still shows as unread
                const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(hintText);
                expect(displayNameTexts).toHaveLength(2);
                expect(lodashGet(displayNameTexts[0], ['props', 'style', 0, 'fontWeight'])).toBe(undefined);
                expect(lodashGet(displayNameTexts[0], ['props', 'children'])).toBe('C User');
                expect(lodashGet(displayNameTexts[1], ['props', 'style', 0, 'fontWeight'])).toBe(fontWeightBold);
                expect(lodashGet(displayNameTexts[1], ['props', 'children'])).toBe('B User');
            }));

    xit('Manually marking a chat message as unread shows the new line indicator and updates the LHN', () =>
        signInAndGetAppWithUnreadChat()
            // Navigate to the unread report
            .then(() => navigateToSidebarOption(0))
            .then(() => {
                // It's difficult to trigger marking a report comment as unread since we would have to mock the long press event and then
                // another press on the context menu item so we will do it via the action directly and then test if the UI has updated properly
                Report.markCommentAsUnread(REPORT_ID, reportAction3CreatedDate);
                return waitForPromisesToResolve();
            })
            .then(() => {
                // Verify the indicator appears above the last action
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
                const reportActionID = lodashGet(unreadIndicator, [0, 'props', 'data-action-id']);
                expect(reportActionID).toBe('3');

                // Scroll up and verify the new messages badge appears
                scrollUpToRevealNewMessagesBadge();
                return waitFor(() => expect(isNewMessagesBadgeVisible()).toBe(true));
            })

            // Navigate to the sidebar
            .then(navigateToSidebar)
            .then(() => {
                // Verify the report is marked as unread in the sidebar
                const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(hintText);
                expect(displayNameTexts).toHaveLength(1);
                expect(lodashGet(displayNameTexts[0], ['props', 'style', 0, 'fontWeight'])).toBe(fontWeightBold);
                expect(lodashGet(displayNameTexts[0], ['props', 'children'])).toBe('B User');

                // Navigate to the report again and back to the sidebar
                return navigateToSidebarOption(0);
            })
            .then(() => navigateToSidebar())
            .then(() => {
                // Verify the report is now marked as read
                const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(hintText);
                expect(displayNameTexts).toHaveLength(1);
                expect(lodashGet(displayNameTexts[0], ['props', 'style', 0, 'fontWeight'])).toBe(undefined);
                expect(lodashGet(displayNameTexts[0], ['props', 'children'])).toBe('B User');

                // Navigate to the report again and verify the new line indicator is missing
                return navigateToSidebarOption(0);
            })
            .then(() => {
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
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
            .then(() => {
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);

                // Leave a comment as the current user and verify the indicator is removed
                Report.addComment(REPORT_ID, 'Current User Comment 1');
                return waitForPromisesToResolve();
            })
            .then(() => {
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
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
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);

                // Then back to the LHN - then back to the chat again and verify the new line indicator has cleared
                return navigateToSidebar();
            })
            .then(() => navigateToSidebarOption(0))
            .then(() => {
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(0);

                // Mark a previous comment as unread and verify the unread action indicator returns
                Report.markCommentAsUnread(REPORT_ID, reportAction9CreatedDate);
                return waitForPromisesToResolve();
            })
            .then(() => {
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
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
        let reportActions;
        let lastReportAction;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val),
        });
        return (
            signInAndGetAppWithUnreadChat()
                // Navigate to the chat and simulate leaving a comment from the current user
                .then(() => navigateToSidebarOption(0))
                .then(() => {
                    // Leave a comment as the current user
                    Report.addComment(REPORT_ID, 'Current User Comment 1');
                    return waitForPromisesToResolve();
                })
                .then(() => {
                    // Simulate the response from the server so that the comment can be deleted in this test
                    lastReportAction = {...CollectionUtils.lastItem(reportActions)};
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                        lastMessageText: lastReportAction.message[0].text,
                        lastVisibleActionCreated: DateUtils.getDBTime(lastReportAction.timestamp),
                        lastActorAccountID: lastReportAction.actorAccountID,
                        reportID: REPORT_ID,
                    });
                    return waitForPromisesToResolve();
                })
                .then(() => {
                    // Verify the chat preview text matches the last comment from the current user
                    const hintText = Localize.translateLocal('accessibilityHints.lastChatMessagePreview');
                    const alternateText = screen.queryAllByLabelText(hintText);
                    expect(alternateText).toHaveLength(1);
                    expect(alternateText[0].props.children).toBe('Current User Comment 1');

                    Report.deleteReportComment(REPORT_ID, lastReportAction);
                    return waitForPromisesToResolve();
                })
                .then(() => {
                    const hintText = Localize.translateLocal('accessibilityHints.lastChatMessagePreview');
                    const alternateText = screen.queryAllByLabelText(hintText);
                    expect(alternateText).toHaveLength(1);
                    expect(alternateText[0].props.children).toBe('Comment 9');
                })
        );
    });
});
