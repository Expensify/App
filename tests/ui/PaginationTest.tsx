/* eslint-disable @typescript-eslint/naming-convention */
import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';
import {addSeconds, format, subMinutes} from 'date-fns';
import React from 'react';
import Onyx from 'react-native-onyx';
import {waitForIdle} from '@libs/Network/SequentialQueue';
import {setSidebarLoaded} from '@userActions/App';
import {subscribeToUserEvents} from '@userActions/User';
import App from '@src/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(120000);

jest.mock('@libs/BootSplash', () => ({
    hide: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@react-navigation/native');
jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');
jest.mock('../../src/components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators', () => jest.fn());

TestHelper.setupApp();
const fetchMock = TestHelper.setupGlobalFetchMock();

const LIST_SIZE = {
    width: 300,
    height: 400,
};
const LIST_CONTENT_SIZE = {
    width: 300,
    height: 600,
};
const TEN_MINUTES_AGO = subMinutes(new Date(), 10);

const REPORT_ID = '1';
const COMMENT_LINKING_REPORT_ID = '2';
const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';
const USER_B_ACCOUNT_ID = 2;
const USER_B_EMAIL = 'user_b@test.com';
const TEST_AUTH_TOKEN = 'test-auth-token';
const TEST_AUTO_GENERATED_LOGIN = 'expensify.cash-abc123';

function getReportScreen(reportID = REPORT_ID) {
    return screen.getByTestId(`report-screen-${reportID}`);
}

function scrollToOffset(offset: number) {
    const hintText = TestHelper.translateLocal('sidebarScreen.listOfChatMessages');
    fireEvent.scroll(within(getReportScreen()).getByLabelText(hintText), {
        nativeEvent: {
            contentOffset: {
                y: offset,
            },
            contentSize: LIST_CONTENT_SIZE,
            layoutMeasurement: LIST_SIZE,
        },
    });
}

function triggerListLayout(reportID?: string) {
    const report = getReportScreen(reportID);
    fireEvent(within(report).getByTestId('report-actions-view-wrapper'), 'onLayout', {
        nativeEvent: {
            layout: {
                x: 0,
                y: 0,
                ...LIST_SIZE,
            },
        },
        persist: () => {},
    });

    fireEvent(within(report).getByTestId('report-actions-list'), 'onContentSizeChange', LIST_CONTENT_SIZE.width, LIST_CONTENT_SIZE.height);
}

function getReportActions(reportID?: string) {
    const report = getReportScreen(reportID);
    return [
        ...within(report).queryAllByLabelText(TestHelper.translateLocal('accessibilityHints.chatMessage')),
        // Created action has a different accessibility label.
        ...within(report).queryAllByLabelText(TestHelper.translateLocal('accessibilityHints.chatWelcomeMessage')),
    ];
}

async function navigateToSidebarOption(reportID: string): Promise<void> {
    const optionRow = screen.getByTestId(reportID);
    fireEvent(optionRow, 'press');
    await waitFor(() => {
        (NativeNavigation as NativeNavigationMock).triggerTransitionEnd();
    });
    // ReportScreen relies on the onLayout event to receive updates from onyx.
    triggerListLayout(reportID);
    await waitForBatchedUpdatesWithAct();
}

function buildCreatedAction(reportActionID: string, created: string) {
    return {
        reportActionID,
        actionName: 'CREATED' as const,
        created,
        message: [
            {
                type: 'TEXT',
                text: 'CREATED',
            },
        ],
    };
}

function buildReportComments(count: number, initialID: string, reverse = false) {
    let currentID = parseInt(initialID, 10);
    const result: Record<string, Partial<ReportAction>> = {};
    for (let i = 0; i < count; i++) {
        if (currentID < 1) {
            break;
        }
        const created = format(addSeconds(TEN_MINUTES_AGO, 10 * currentID), CONST.DATE.FNS_DB_FORMAT_STRING);
        const id = currentID;
        currentID += reverse ? 1 : -1;
        result[`${id}`] = id === 1 ? buildCreatedAction('1', created) : TestHelper.buildTestReportComment(created, USER_B_ACCOUNT_ID, `${id}`);
    }
    return result;
}

function mockOpenReport(messageCount: number, initialID: string) {
    fetchMock.mockAPICommand('OpenReport', ({reportID}) => {
        const comments = buildReportComments(messageCount, initialID);
        return {
            onyxData:
                reportID === REPORT_ID
                    ? [
                          {
                              onyxMethod: 'merge',
                              key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                              value: comments,
                          },
                      ]
                    : [],
            hasOlderActions: !comments['1'],
            hasNewerActions: !!reportID,
        };
    });
}

function mockGetOlderActions(messageCount: number) {
    fetchMock.mockAPICommand('GetOlderActions', ({reportID, reportActionID}) => {
        // The API also returns the action that was requested with the reportActionID.
        const comments = buildReportComments(messageCount + 1, reportActionID);
        return {
            onyxData:
                reportID === REPORT_ID
                    ? [
                          {
                              onyxMethod: 'merge',
                              key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                              value: comments,
                          },
                      ]
                    : [],
            hasOlderActions: comments['1'] != null,
        };
    });
}

function mockGetNewerActions(messageCount: number) {
    fetchMock.mockAPICommand('GetNewerActions', ({reportID, reportActionID}) => ({
        onyxData:
            reportID === REPORT_ID
                ? [
                      {
                          onyxMethod: 'merge',
                          key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                          // The API also returns the action that was requested with the reportActionID.
                          value: buildReportComments(messageCount + 1, reportActionID, true),
                      },
                  ]
                : [],
        hasNewerActions: messageCount > 0,
    }));
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
 * Sets up a test with a logged in user. Returns the <App/> test instance.
 */
async function signInAndGetApp(): Promise<void> {
    await fastSignInWithTestUser();

    render(<App />);
    await waitForBatchedUpdatesWithAct();

    // Start listening for pusher events after navigation settles.
    subscribeToUserEvents();
    await waitForBatchedUpdates();

    await act(async () => {
        await Promise.all([
            // Simulate setting an unread report and personal details
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                reportID: REPORT_ID,
                reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                lastMessageText: 'Test',
                participants: {
                    [USER_B_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [USER_A_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
                lastActorAccountID: USER_B_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.CHAT,
            }),
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [USER_B_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
            }),

            // Setup a 2nd report to test comment linking.
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${COMMENT_LINKING_REPORT_ID}`, {
                reportID: COMMENT_LINKING_REPORT_ID,
                reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                lastMessageText: 'Test',
                participants: {[USER_A_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
                lastActorAccountID: USER_A_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.CHAT,
            }),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${COMMENT_LINKING_REPORT_ID}`, {
                '100': buildCreatedAction('100', format(TEN_MINUTES_AGO, CONST.DATE.FNS_DB_FORMAT_STRING)),
                '101': {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    person: [{type: 'TEXT', style: 'strong', text: 'User B'}],
                    created: format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING),
                    message: [
                        {
                            type: 'COMMENT',
                            html: '<a href="https://dev.new.expensify.com:8082/r/1/5">Link 1</a>',
                            text: 'Link 1',
                        },
                    ],
                    reportActionID: '101',
                    actorAccountID: USER_A_ACCOUNT_ID,
                },
            }),
        ]);

        // Manually mark the sidebar as loaded since onLayout does not fire in tests.
        setSidebarLoaded();
    });

    await waitForBatchedUpdatesWithAct();
}

describe('Pagination', () => {
    afterEach(async () => {
        await waitForIdle();
        await act(async () => {
            await Onyx.clear();

            // Unsubscribe to pusher channels
            PusherHelper.teardown();
        });

        await waitForBatchedUpdatesWithAct();

        jest.clearAllMocks();
    });

    it('opens a chat and load initial messages', async () => {
        mockOpenReport(5, '5');

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        expect(getReportActions()).toHaveLength(5);
        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith('OpenReport', 0, {reportID: REPORT_ID});
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);

        // Scrolling here should not trigger a new network request.
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(0);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
    });

    it('opens a chat and load older messages', async () => {
        mockOpenReport(CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT, '18');
        mockGetOlderActions(5);

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        expect(getReportActions()).toHaveLength(CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT);
        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith('OpenReport', 0, {reportID: REPORT_ID});
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);

        // Scrolling here should trigger a new network request.
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith('GetOlderActions', 0, {reportID: REPORT_ID, reportActionID: '4'});
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);

        await waitForNetworkPromises();
        await waitForBatchedUpdatesWithAct();

        // We now have 18 messages. 15 (MIN_INITIAL_REPORT_ACTION_COUNT) from the initial OpenReport and 3 from GetOlderActions.
        // GetOlderActions only returns 3 actions since it reaches id '1', which is the created action.
        await waitFor(() => {
            expect(getReportActions()).toHaveLength(18);
        });
    });

    it('opens a chat and load newer messages', async () => {
        mockOpenReport(5, '5');
        mockGetNewerActions(5);

        await signInAndGetApp();
        await navigateToSidebarOption(COMMENT_LINKING_REPORT_ID);

        const link = screen.getByText('Link 1');
        fireEvent(link, 'press');
        await waitFor(() => {
            (NativeNavigation as NativeNavigationMock).triggerTransitionEnd();
        });
        // Due to https://github.com/facebook/react-native/commit/3485e9ed871886b3e7408f90d623da5c018da493
        // we need to scroll too to trigger `onStartReached` which triggers other updates
        scrollToOffset(0);
        // ReportScreen relies on the onLayout event to receive updates from onyx.
        triggerListLayout();
        await waitForBatchedUpdatesWithAct();

        // Here we have 5 messages from the initial OpenReport and 5 from the initial GetNewerActions.
        expect(getReportActions()).toHaveLength(10);

        // There is 1 extra call here because of the comment linking report.
        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 3);
        TestHelper.expectAPICommandToHaveBeenCalledWith('OpenReport', 1, {reportID: REPORT_ID, reportActionID: '5'});
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalledWith('GetNewerActions', 0, {reportID: REPORT_ID, reportActionID: '5'});

        // Simulate the maintainVisibleContentPosition scroll adjustment, so it is now possible to scroll down more.
        scrollToOffset(500);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(0);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 3);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 1);

        // We now have 10 messages. 5 from the initial OpenReport and 5 from the GetNewerActions call.
        expect(getReportActions()).toHaveLength(10);

        // Simulate the backend returning no new messages to simulate reaching the start of the chat.
        mockGetNewerActions(0);

        scrollToOffset(500);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(0);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 3);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 1);

        // We still have 15 messages. 5 from the initial OpenReport and 5 from the GetNewerActions call.
        expect(getReportActions()).toHaveLength(10);
    });
});
