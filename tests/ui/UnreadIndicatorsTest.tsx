/* eslint-disable @typescript-eslint/naming-convention */
import type * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {addSeconds, format, subMinutes, subSeconds} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';
import React from 'react';
import {AppState, DeviceEventEmitter, Linking} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type Animated from 'react-native-reanimated';
import * as CollectionUtils from '@libs/CollectionUtils';
import DateUtils from '@libs/DateUtils';
import * as Localize from '@libs/Localize';
import LocalNotification from '@libs/Notification/LocalNotification';
import * as NumberUtils from '@libs/NumberUtils';
import * as Pusher from '@libs/Pusher/pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import FontUtils from '@styles/utils/FontUtils';
import * as AppActions from '@userActions/App';
import * as Report from '@userActions/Report';
import * as User from '@userActions/User';
import App from '@src/App';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import appSetup from '@src/setup';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(30000);

jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');
jest.mock('../../src/components/ConfirmedRoute.tsx');

// Needed for: https://stackoverflow.com/questions/76903168/mocking-libraries-in-jest
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}));

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<typeof Animated>('react-native-reanimated/mock'),
    createAnimatedPropAdapter: jest.fn,
    useReducedMotion: jest.fn,
}));

/**
 * We need to keep track of the transitionEnd callback so we can trigger it in our tests
 */
let transitionEndCB: () => void;

type ListenerMock = {
    triggerTransitionEnd: () => void;
    addListener: jest.Mock;
};

/**
 * This is a helper function to create a mock for the addListener function of the react-navigation library.
 * The reason we need this is because we need to trigger the transitionEnd event in our tests to simulate
 * the transitionEnd event that is triggered when the screen transition animation is completed.
 *
 * P.S: This can't be moved to a utils file because Jest wants any external function to stay in the scope.
 *
 * @returns An object with two functions: triggerTransitionEnd and addListener
 */
const createAddListenerMock = (): ListenerMock => {
    const transitionEndListeners: Array<() => void> = [];
    const triggerTransitionEnd = () => {
        transitionEndListeners.forEach((transitionEndListener) => transitionEndListener());
    };

    const addListener: jest.Mock = jest.fn().mockImplementation((listener, callback) => {
        if (listener === 'transitionEnd') {
            transitionEndListeners.push(callback);
        }
        return () => {
            // eslint-disable-next-line rulesdir/prefer-underscore-method
            transitionEndListeners.filter((cb) => cb !== callback);
        };
    });

    return {triggerTransitionEnd, addListener};
};

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    const {triggerTransitionEnd, addListener} = createAddListenerMock();
    transitionEndCB = triggerTransitionEnd;

    const useNavigation = () =>
        ({
            navigate: jest.fn(),
            ...actualNav.useNavigation,
            getState: () => ({
                routes: [],
            }),
            addListener,
        } as typeof NativeNavigation.useNavigation);

    return {
        ...actualNav,
        useNavigation,
        getState: () => ({
            routes: [],
        }),
    } as typeof NativeNavigation;
});

beforeAll(() => {
    // In this test, we are generically mocking the responses of all API requests by mocking fetch() and having it
    // return 200. In other tests, we might mock HttpUtils.xhr() with a more specific mock data response (which means
    // fetch() never gets called so it does not need mocking) or we might have fetch throw an error to test error handling
    // behavior. But here we just want to treat all API requests as a generic "success" and in the cases where we need to
    // simulate data arriving we will just set it into Onyx directly with Onyx.merge() or Onyx.set() etc.
    // @ts-expect-error -- TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated
    global.fetch = TestHelper.getGlobalFetchMock();

    Linking.setInitialURL('https://new.expensify.com/');
    appSetup();

    // Connect to Pusher
    PusherConnectionManager.init();
    Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
    });
});

function scrollUpToRevealNewMessagesBadge() {
    const hintText = Localize.translateLocal('sidebarScreen.listOfChatMessages');
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
    const hintText = Localize.translateLocal('accessibilityHints.scrollToNewestMessages');
    const badge = screen.queryByAccessibilityHint(hintText);
    return Math.round(badge?.props.style.transform[0].translateY) === -40;
}

function navigateToSidebar(): Promise<void> {
    const hintText = Localize.translateLocal('accessibilityHints.navigateToChatsList');
    const reportHeaderBackButton = screen.queryByAccessibilityHint(hintText);
    if (reportHeaderBackButton) {
        fireEvent(reportHeaderBackButton, 'press');
    }
    return waitForBatchedUpdates();
}

async function navigateToSidebarOption(index: number): Promise<void> {
    const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
    const optionRows = screen.queryAllByAccessibilityHint(hintText);
    fireEvent(optionRows[index], 'press');
    await waitForBatchedUpdatesWithAct();
}

function areYouOnChatListScreen(): boolean {
    const hintText = Localize.translateLocal('sidebarScreen.listOfChats');
    const sidebarLinks = screen.queryAllByLabelText(hintText);

    return !sidebarLinks?.[0]?.props?.accessibilityElementsHidden;
}

const REPORT_ID = '1';
const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';
const USER_B_ACCOUNT_ID = 2;
const USER_B_EMAIL = 'user_b@test.com';
const USER_C_ACCOUNT_ID = 3;
const USER_C_EMAIL = 'user_c@test.com';
let reportAction3CreatedDate: string;
let reportAction9CreatedDate: string;

/**
 * Sets up a test with a logged in user that has one unread chat from another user. Returns the <App/> test instance.
 */
function signInAndGetAppWithUnreadChat(): Promise<void> {
    // Render the App and sign in as a test user.
    render(<App />);
    return waitForBatchedUpdatesWithAct()
        .then(async () => {
            await waitForBatchedUpdatesWithAct();
            const hintText = Localize.translateLocal('loginForm.loginForm');
            const loginForm = screen.queryAllByLabelText(hintText);
            expect(loginForm).toHaveLength(1);

            await act(async () => {
                await TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A');
            });
            return waitForBatchedUpdatesWithAct();
        })
        .then(() => {
            User.subscribeToUserEvents();
            return waitForBatchedUpdates();
        })
        .then(async () => {
            const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
            reportAction3CreatedDate = format(addSeconds(TEN_MINUTES_AGO, 30), CONST.DATE.FNS_DB_FORMAT_STRING);
            reportAction9CreatedDate = format(addSeconds(TEN_MINUTES_AGO, 90), CONST.DATE.FNS_DB_FORMAT_STRING);

            // Simulate setting an unread report and personal details
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                reportID: REPORT_ID,
                reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                lastReadTime: reportAction3CreatedDate,
                lastVisibleActionCreated: reportAction9CreatedDate,
                lastMessageText: 'Test',
                participantAccountIDs: [USER_B_ACCOUNT_ID],
                lastActorAccountID: USER_B_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.CHAT,
            });
            const createdReportActionID = NumberUtils.rand64().toString();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [createdReportActionID]: {
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
                },
                1: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '1', createdReportActionID),
                2: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 20), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '2', '1'),
                3: TestHelper.buildTestReportComment(reportAction3CreatedDate, USER_B_ACCOUNT_ID, '3', '2'),
                4: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 40), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '4', '3'),
                5: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 50), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '5', '4'),
                6: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 60), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '6', '5'),
                7: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 70), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '7', '6'),
                8: TestHelper.buildTestReportComment(format(addSeconds(TEN_MINUTES_AGO, 80), CONST.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '8', '7'),
                9: TestHelper.buildTestReportComment(reportAction9CreatedDate, USER_B_ACCOUNT_ID, '9', '8'),
            });
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [USER_B_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
            });

            // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
            AppActions.setSidebarLoaded();
            return waitForBatchedUpdatesWithAct();
        });
}

describe('Unread Indicators', () => {
    afterEach(() => {
        jest.clearAllMocks();
        Onyx.clear();

        // Unsubscribe to pusher channels
        PusherHelper.teardown();
    });

    it('Display bold in the LHN for unread chat and new line indicator above the chat message when we navigate to it', () =>
        signInAndGetAppWithUnreadChat()
            .then(() => {
                // Verify no notifications are created for these older messages
                expect((LocalNotification.showCommentNotification as jest.Mock).mock.calls).toHaveLength(0);

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
                expect(displayNameText?.props?.style?.fontWeight).toBe(FontUtils.fontWeight.bold);

                return navigateToSidebarOption(0);
            })
            .then(async () => {
                await act(() => transitionEndCB?.());

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
                const reportActionID = unreadIndicator[0]?.props?.['data-action-id'];
                expect(reportActionID).toBe('4');
                // Scroll up and verify that the "New messages" badge appears
                scrollUpToRevealNewMessagesBadge();
                return waitFor(() => expect(isNewMessagesBadgeVisible()).toBe(true));
            }));
    it('Clear the new line indicator and bold when we navigate away from a chat that is now read', () =>
        signInAndGetAppWithUnreadChat()
            // Navigate to the unread chat from the sidebar
            .then(() => navigateToSidebarOption(0))
            .then(async () => {
                await act(() => transitionEndCB?.());
                // Verify the unread indicator is present
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
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
                // We set the created date 5 seconds in the past to ensure that time has passed when we open the report
                const NEW_REPORT_ID = '2';
                const NEW_REPORT_CREATED_DATE = subSeconds(new Date(), 5);
                const NEW_REPORT_FIST_MESSAGE_CREATED_DATE = addSeconds(NEW_REPORT_CREATED_DATE, 1);
                const createdReportActionID = NumberUtils.rand64();
                const commentReportActionID = NumberUtils.rand64();
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${NEW_REPORT_ID}`,
                        value: {
                            reportID: NEW_REPORT_ID,
                            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                            lastReadTime: '',
                            lastVisibleActionCreated: DateUtils.getDBTime(utcToZonedTime(NEW_REPORT_FIST_MESSAGE_CREATED_DATE, 'UTC').valueOf()),
                            lastMessageText: 'Comment 1',
                            lastActorAccountID: USER_C_ACCOUNT_ID,
                            participantAccountIDs: [USER_C_ACCOUNT_ID],
                            type: CONST.REPORT.TYPE.CHAT,
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${NEW_REPORT_ID}`,
                        value: {
                            [createdReportActionID]: {
                                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                                automatic: false,
                                created: format(NEW_REPORT_CREATED_DATE, CONST.DATE.FNS_DB_FORMAT_STRING),
                                reportActionID: createdReportActionID,
                            },
                            [commentReportActionID]: {
                                actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
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
                expect(firstReportOption?.props?.style?.fontWeight).toBe(FontUtils.fontWeight.bold);
                expect(firstReportOption?.props?.children?.[0]).toBe('C User');

                const secondReportOption = displayNameTexts[1];
                expect(secondReportOption?.props?.style?.fontWeight).toBe(FontUtils.fontWeight.bold);
                expect(secondReportOption?.props?.children?.[0]).toBe('B User');

                // Tap the new report option and navigate back to the sidebar again via the back button
                return navigateToSidebarOption(0);
            })
            .then(waitForBatchedUpdates)
            .then(async () => {
                await act(() => transitionEndCB?.());
                // Verify that report we navigated to appears in a "read" state while the original unread report still shows as unread
                const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(hintText);
                expect(displayNameTexts).toHaveLength(2);
                expect(displayNameTexts[0]?.props?.style?.fontWeight).toBe(undefined);
                expect(displayNameTexts[0]?.props?.children?.[0]).toBe('C User');
                expect(displayNameTexts[1]?.props?.style?.fontWeight).toBe(FontUtils.fontWeight.bold);
                expect(displayNameTexts[1]?.props?.children?.[0]).toBe('B User');
            }));

    xit('Manually marking a chat message as unread shows the new line indicator and updates the LHN', () =>
        signInAndGetAppWithUnreadChat()
            // Navigate to the unread report
            .then(() => navigateToSidebarOption(0))
            .then(() => {
                // It's difficult to trigger marking a report comment as unread since we would have to mock the long press event and then
                // another press on the context menu item so we will do it via the action directly and then test if the UI has updated properly
                Report.markCommentAsUnread(REPORT_ID, reportAction3CreatedDate);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Verify the indicator appears above the last action
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
                const reportActionID = unreadIndicator[0]?.props?.['data-action-id'];
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
                expect(displayNameTexts[0]?.props?.style?.fontWeight).toBe(FontUtils.fontWeight.bold);
                expect(displayNameTexts[0]?.props?.children?.[0]).toBe('B User');

                // Navigate to the report again and back to the sidebar
                return navigateToSidebarOption(0);
            })
            .then(() => navigateToSidebar())
            .then(() => {
                // Verify the report is now marked as read
                const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                const displayNameTexts = screen.queryAllByLabelText(hintText);
                expect(displayNameTexts).toHaveLength(1);
                expect(displayNameTexts[0]?.props?.style?.fontWeight).toBe(undefined);
                expect(displayNameTexts[0]?.props?.children?.[0]).toBe('B User');

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
            .then(async () => {
                await act(() => transitionEndCB?.());
                const newMessageLineIndicatorHintText = Localize.translateLocal('accessibilityHints.newMessageLineIndicator');
                const unreadIndicator = screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);

                // Leave a comment as the current user and verify the indicator is removed
                Report.addComment(REPORT_ID, 'Current User Comment 1');
                return waitForBatchedUpdates();
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
                return waitForBatchedUpdates();
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
                .then(() => {
                    // Leave a comment as the current user
                    Report.addComment(REPORT_ID, 'Current User Comment 1');
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // Simulate the response from the server so that the comment can be deleted in this test
                    lastReportAction = reportActions ? CollectionUtils.lastItem(reportActions) : undefined;
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                        lastMessageText: lastReportAction?.message?.[0]?.text,
                        lastVisibleActionCreated: DateUtils.getDBTime(lastReportAction?.timestamp),
                        lastActorAccountID: lastReportAction?.actorAccountID,
                        reportID: REPORT_ID,
                    });
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // Verify the chat preview text matches the last comment from the current user
                    const hintText = Localize.translateLocal('accessibilityHints.lastChatMessagePreview');
                    const alternateText = screen.queryAllByLabelText(hintText);
                    expect(alternateText).toHaveLength(1);
                    expect(alternateText[0].props.children).toBe('Current User Comment 1');

                    if (lastReportAction) {
                        Report.deleteReportComment(REPORT_ID, lastReportAction);
                    }
                    return waitForBatchedUpdates();
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
