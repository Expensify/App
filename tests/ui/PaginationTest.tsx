/* eslint-disable @typescript-eslint/naming-convention */
import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react-native';
import {addSeconds, format, subMinutes} from 'date-fns';
import React from 'react';
import Onyx from 'react-native-onyx';
import {setSidebarLoaded} from '@libs/actions/App';
import {subscribeToUserEvents} from '@libs/actions/User';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {translateLocal} from '@libs/Localize';
import {waitForIdle} from '@libs/Network/SequentialQueue';
import App from '@src/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import PusherHelper from '../utils/PusherHelper';
import {getReportScreen, LIST_CONTENT_SIZE, navigateToSidebarOption, REPORT_ID, scrollToOffset, triggerListLayout} from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(120000);

jest.mock('@react-navigation/native');
jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');
jest.mock('../../src/components/ConfirmedRoute.tsx');
jest.mock('@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators', () => jest.fn());

TestHelper.setupApp();
const fetchMock = TestHelper.setupGlobalFetchMock();

const TEN_MINUTES_AGO = subMinutes(new Date(), 10);

const COMMENT_LINKING_REPORT_ID = '2';
const USER_A_ACCOUNT_ID = 1;
const USER_A_EMAIL = 'user_a@test.com';
const USER_B_ACCOUNT_ID = 2;
const USER_B_EMAIL = 'user_b@test.com';

function getReportActions(reportID?: string) {
    const report = getReportScreen(reportID);
    return [
        ...within(report).queryAllByLabelText(translateLocal('accessibilityHints.chatMessage')),
        // Created action has a different accessibility label.
        ...within(report).queryAllByLabelText(translateLocal('accessibilityHints.chatWelcomeMessage')),
    ];
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
    fetchMock.mockAPICommand(WRITE_COMMANDS.OPEN_REPORT, ({reportID, reportActionID}) => {
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
            hasNewerActions: !!reportActionID,
            oldestUnreadReportActionID: null,
        };
    });
}

function mockGetOlderActions(messageCount: number) {
    fetchMock.mockAPICommand(READ_COMMANDS.GET_OLDER_ACTIONS, ({reportID, reportActionID}) => {
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
    fetchMock.mockAPICommand(READ_COMMANDS.GET_NEWER_ACTIONS, ({reportID, reportActionID}) => ({
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

/**
 * Sets up a test with a logged in user. Returns the <App/> test instance.
 */
async function signInAndGetApp(): Promise<void> {
    // Render the App and sign in as a test user.
    render(<App />);
    await waitForBatchedUpdatesWithAct();
    const hintText = translateLocal('loginForm.loginForm');
    const loginForm = await screen.findAllByLabelText(hintText);
    expect(loginForm).toHaveLength(1);

    await act(async () => {
        await TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A');
    });

    await waitForBatchedUpdatesWithAct();

    subscribeToUserEvents();

    await waitForBatchedUpdates();

    await act(async () => {
        // Simulate setting a report and personal details
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            lastMessageText: 'Test',
            lastReadTime: format(new Date(), CONST.DATE.FNS_DB_FORMAT_STRING),
            participants: {
                [USER_B_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [USER_A_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            lastActorAccountID: USER_B_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.CHAT,
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_OLDEST_UNREAD_REPORT_ACTION_ID}${REPORT_ID}`, '-1');

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [USER_B_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
        });

        // Setup a 2nd report to test comment linking.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${COMMENT_LINKING_REPORT_ID}`, {
            reportID: COMMENT_LINKING_REPORT_ID,
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            lastMessageText: 'Test',
            lastReadTime: format(new Date(), CONST.DATE.FNS_DB_FORMAT_STRING),
            participants: {[USER_A_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            lastActorAccountID: USER_A_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.CHAT,
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_OLDEST_UNREAD_REPORT_ACTION_ID}${COMMENT_LINKING_REPORT_ID}`, '-1');

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${COMMENT_LINKING_REPORT_ID}`, {
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
        });

        // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
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
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.OPEN_REPORT, 0, {reportID: REPORT_ID});
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_OLDER_ACTIONS, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_NEWER_ACTIONS, 0);

        // Scrolling here should not trigger a new network request.
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(0);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 1);
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_OLDER_ACTIONS, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_NEWER_ACTIONS, 0);
    });

    it('opens a chat and load older messages', async () => {
        mockOpenReport(CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT, '18');
        mockGetOlderActions(5);

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        expect(getReportActions()).toHaveLength(CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.OPEN_REPORT, 0, {reportID: REPORT_ID});
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_OLDER_ACTIONS, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_NEWER_ACTIONS, 0);

        // Scrolling here should trigger a new network request.
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 1);
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_OLDER_ACTIONS, 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith(READ_COMMANDS.GET_OLDER_ACTIONS, 0, {reportID: REPORT_ID, reportActionID: '4'});
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_NEWER_ACTIONS, 0);

        await waitForNetworkPromises();

        // We now have 18 messages. 15 (MIN_INITIAL_REPORT_ACTION_COUNT) from the initial OpenReport and 3 from GetOlderActions.
        // GetOlderActions only returns 3 actions since it reaches id '1', which is the created action.
        expect(getReportActions()).toHaveLength(18);
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
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 3);
        TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.OPEN_REPORT, 1, {reportID: REPORT_ID, reportActionID: '5'});
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_OLDER_ACTIONS, 0);
        TestHelper.expectAPICommandToHaveBeenCalledWith(READ_COMMANDS.GET_NEWER_ACTIONS, 0, {reportID: REPORT_ID, reportActionID: '5'});

        // Simulate the backend returning no new messages to simulate reaching the start of the chat.
        mockGetNewerActions(0);

        // Simulate the maintainVisibleContentPosition scroll adjustment, so it is now possible to scroll down more.
        scrollToOffset(500);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(0);
        await waitForBatchedUpdatesWithAct();

        // We now have 10 messages. 5 from the initial OpenReport and 5 from the GetNewerActions call.
        expect(getReportActions()).toHaveLength(10);

        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 3);
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_OLDER_ACTIONS, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_NEWER_ACTIONS, 2);

        scrollToOffset(500);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(0);
        await waitForBatchedUpdatesWithAct();

        // When there are no newer actions, we don't want to trigger GetNewerActions again.
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 3);
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_OLDER_ACTIONS, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(READ_COMMANDS.GET_NEWER_ACTIONS, 2);

        // We still have 10 messages. 5 from the initial OpenReport and 5 from the GetNewerActions call.
        expect(getReportActions()).toHaveLength(10);
    });
});
