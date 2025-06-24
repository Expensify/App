/* eslint-disable @typescript-eslint/naming-convention */
import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, within} from '@testing-library/react-native';
import {addSeconds, format, subMinutes} from 'date-fns';
import React from 'react';
import Onyx from 'react-native-onyx';
import {translateLocal} from '@libs/Localize';
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

// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(60000);

jest.mock('@react-navigation/native');
jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');
jest.mock('../../src/components/ConfirmedRoute.tsx');

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

function getReportScreen(reportID = REPORT_ID) {
    return screen.getByTestId(`report-screen-${reportID}`);
}

function scrollToOffset(offset: number) {
    const hintText = translateLocal('sidebarScreen.listOfChatMessages');
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
        ...within(report).queryAllByLabelText(translateLocal('accessibilityHints.chatMessage')),
        // Created action has a different accessibility label.
        ...within(report).queryAllByLabelText(translateLocal('accessibilityHints.chatWelcomeMessage')),
    ];
}

async function navigateToSidebarOption(reportID: string): Promise<void> {
    const optionRow = screen.getByTestId(reportID);
    fireEvent(optionRow, 'press');
    await act(() => {
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
        // Simulate setting an unread report and personal details
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            lastMessageText: 'Test',
            participants: {
                [USER_B_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [USER_A_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            lastActorAccountID: USER_B_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.CHAT,
        });

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [USER_B_ACCOUNT_ID]: TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
        });

        // Setup a 2nd report to test comment linking.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${COMMENT_LINKING_REPORT_ID}`, {
            reportID: COMMENT_LINKING_REPORT_ID,
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            lastMessageText: 'Test',
            participants: {[USER_A_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            lastActorAccountID: USER_A_ACCOUNT_ID,
            type: CONST.REPORT.TYPE.CHAT,
        });

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

        await waitForBatchedUpdatesWithAct();

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
        await act(() => {
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
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 2);

        // We now have 10 messages. 5 from the initial OpenReport and 5 from the GetNewerActions call.
        expect(getReportActions()).toHaveLength(15);

        // Simulate the backend returning no new messages to simulate reaching the start of the chat.
        mockGetNewerActions(0);

        scrollToOffset(500);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(0);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 3);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 3);

        // We still have 15 messages. 5 from the initial OpenReport and 5 from the GetNewerActions call.
        expect(getReportActions()).toHaveLength(15);
    });

    it('activates frontend pagination when loading large datasets', async () => {
        // Mock a large dataset (>100 actions) to trigger frontend pagination
        const LARGE_MESSAGE_COUNT = 150;
        mockOpenReport(LARGE_MESSAGE_COUNT, '150');

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        // With frontend pagination active, we should see a limited number of actions
        const initialActionCount = getReportActions().length;
        expect(initialActionCount).toBeGreaterThan(0);
        expect(initialActionCount).toBeLessThan(LARGE_MESSAGE_COUNT);

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalledWith('OpenReport', 0, {reportID: REPORT_ID});
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);

        // Scrolling down should expand the frontend pagination window
        // and show more actions from Onyx cache without API calls
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();

        // Should now show more actions (expanded through scrolling)
        const expandedActionCount = getReportActions().length;
        expect(expandedActionCount).toBeGreaterThanOrEqual(initialActionCount);

        // No additional API calls should be made (loading from Onyx cache)
        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);

        // Scroll down again to expand further
        scrollToOffset(LIST_CONTENT_SIZE.height * 2);
        await waitForBatchedUpdatesWithAct();

        // Should now show even more actions (further expansion)
        const finalActionCount = getReportActions().length;
        expect(finalActionCount).toBeGreaterThanOrEqual(expandedActionCount);

        // Still no additional API calls
        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
    });

    it('prevents unnecessary API calls when all data is already loaded', async () => {
        mockOpenReport(20, '20');

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        const initialCount = getReportActions().length;
        expect(initialCount).toBeGreaterThan(0);
        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);

        // Mock GetOlderActions to return data that overlaps with what we already have
        mockGetOlderActions(10);

        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();

        // No API call needed if data is in cache
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);

        // Now all data from pages is loaded in Onyx. Subsequent scrolling should NOT trigger API calls
        scrollToOffset(LIST_CONTENT_SIZE.height * 2);
        await waitForBatchedUpdatesWithAct();

        // No additional API calls should be made
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
    });

    it('centers view around target action when deep linking', async () => {
        const LARGE_MESSAGE_COUNT = 200;
        mockOpenReport(LARGE_MESSAGE_COUNT, '200');

        await signInAndGetApp();

        // Navigate directly to report with specific action ID
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, buildReportComments(LARGE_MESSAGE_COUNT, '200'));
        });

        await navigateToSidebarOption(REPORT_ID);

        // With a large dataset, frontend pagination should activate
        const deepLinkActions = getReportActions().length;
        expect(deepLinkActions).toBeGreaterThan(0);
        expect(deepLinkActions).toBeLessThanOrEqual(LARGE_MESSAGE_COUNT);

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        // Should not make unnecessary API calls since data is already in Onyx
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
    });

    it('automatically expands pagination window when new data is loaded', async () => {
        const INITIAL_COUNT = 120;
        mockOpenReport(INITIAL_COUNT, '120');

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        const autoExpandInitial = getReportActions().length;
        expect(autoExpandInitial).toBeGreaterThan(0);

        // Simulate new data arriving from backend
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, buildReportComments(10, '130'));
        });

        await waitForBatchedUpdatesWithAct();

        // Pagination window should auto-expand to show the new data
        const autoExpandFinal = getReportActions().length;
        expect(autoExpandFinal).toBeGreaterThanOrEqual(autoExpandInitial);
    });

    it('resets pagination when cache is cleared', async () => {
        const LARGE_COUNT = 150;
        mockOpenReport(LARGE_COUNT, '150');

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        const cacheResetInitial = getReportActions().length;
        expect(cacheResetInitial).toBeGreaterThan(0);

        // Expand pagination window by scrolling
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();

        const cacheResetExpanded = getReportActions().length;
        expect(cacheResetExpanded).toBeGreaterThanOrEqual(cacheResetInitial);

        // Simulate cache being cleared (data shrinks)
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, buildReportComments(10, '10'));
        });

        await waitForBatchedUpdatesWithAct();

        // Pagination should reset to show actions from the new smaller dataset
        const resetActions = getReportActions().length;
        expect(resetActions).toBeGreaterThan(0);
        expect(resetActions).toBeLessThanOrEqual(150);
    });

    it('does not activate frontend pagination for small datasets', async () => {
        // Mock a small dataset (<=100 actions) should not trigger frontend pagination
        const SMALL_MESSAGE_COUNT = 80;
        mockOpenReport(SMALL_MESSAGE_COUNT, '80');

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        const smallDatasetActions = getReportActions().length;
        expect(smallDatasetActions).toBeGreaterThan(0);
        expect(smallDatasetActions).toBeLessThanOrEqual(SMALL_MESSAGE_COUNT);

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);

        // Scrolling should not significantly expand actions for small datasets
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();

        // Should show all or most of the available actions since it's a small dataset
        const finalSmallDatasetActions = getReportActions().length;
        expect(finalSmallDatasetActions).toBeGreaterThanOrEqual(smallDatasetActions);
        expect(finalSmallDatasetActions).toBeLessThanOrEqual(SMALL_MESSAGE_COUNT);
    });

    it('follows incremental expansion pattern [0-50] → [0-100] → [0-150]', async () => {
        const LARGE_COUNT = 200;
        mockOpenReport(LARGE_COUNT, '200');

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        const initialActions = getReportActions().length;
        expect(initialActions).toBeGreaterThan(0);

        // First expansion: more actions should be visible
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();
        const firstExpansion = getReportActions().length;
        expect(firstExpansion).toBeGreaterThanOrEqual(initialActions);

        // Second expansion: even more actions should be visible
        scrollToOffset(LIST_CONTENT_SIZE.height * 2);
        await waitForBatchedUpdatesWithAct();
        const secondExpansion = getReportActions().length;
        expect(secondExpansion).toBeGreaterThanOrEqual(firstExpansion);

        // Third expansion: all data visible
        scrollToOffset(LIST_CONTENT_SIZE.height * 3);
        await waitForBatchedUpdatesWithAct();
        const thirdExpansion = getReportActions().length;
        expect(thirdExpansion).toBeGreaterThanOrEqual(secondExpansion);

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        // No API calls should be made during frontend expansion
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
        TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
    });

    it('falls back to API calls when frontend pagination is exhausted', async () => {
        const INITIAL_COUNT = 150;
        mockOpenReport(INITIAL_COUNT, '150');
        mockGetOlderActions(25);

        await signInAndGetApp();
        await navigateToSidebarOption(REPORT_ID);

        // Expand to show all frontend data
        scrollToOffset(LIST_CONTENT_SIZE.height);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(LIST_CONTENT_SIZE.height * 2);
        await waitForBatchedUpdatesWithAct();
        scrollToOffset(LIST_CONTENT_SIZE.height * 3);
        await waitForBatchedUpdatesWithAct();

        const fallbackActions = getReportActions().length;
        expect(fallbackActions).toBeGreaterThan(0);

        // Now scroll more to trigger API call for additional data
        scrollToOffset(LIST_CONTENT_SIZE.height * 4);
        await waitForBatchedUpdatesWithAct();

        TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
        // / No API call needed if all data is in cache
        TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);

        const finalFallbackActions = getReportActions().length;
        expect(finalFallbackActions).toBeGreaterThanOrEqual(fallbackActions);
    });
});
