import type * as reactNavigationNativeImport from '@react-navigation/native';
import {act, screen} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import DateUtils from '@libs/DateUtils';
import {buildOptimisticExpenseReport, buildOptimisticIOUReportAction, buildTransactionThread} from '@libs/ReportUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import FontUtils from '@styles/utils/FontUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ReportAction, ViolationName} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import {chatReportR14932} from '../../__mocks__/reportData/reports';
import createRandomReportAction from '../utils/collections/reportActions';
import getOnyxValue from '../utils/getOnyxValue';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

// Be sure to include the mocked permissions library, as some components that are rendered
// during the test depend on its methods.
jest.mock('@libs/Permissions');

// Mock the useRootNavigationState hook to prevent navigation errors in tests
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

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof reactNavigationNativeImport>('@react-navigation/native'),
    useNavigationState: () => undefined,
    useIsFocused: () => true,
    useRoute: () => ({name: 'Home'}),
    useNavigation: () => undefined,
    useFocusEffect: () => undefined,
}));

type LazyLoadLHNTestUtils = {
    fakePersonalDetails: PersonalDetailsList;
};
jest.mock('@components/withCurrentUserPersonalDetails', () => {
    // Lazy loading of LHNTestUtils
    const lazyLoadLHNTestUtils = () => require<LazyLoadLHNTestUtils>('../utils/LHNTestUtils');

    return <TProps extends WithCurrentUserPersonalDetailsProps>(Component: ComponentType<TProps>) => {
        function WrappedComponent(props: Omit<TProps, keyof WithCurrentUserPersonalDetailsProps>) {
            const currentUserAccountID = 1;
            const LHNTestUtilsMock = lazyLoadLHNTestUtils(); // Load LHNTestUtils here

            return (
                <Component
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(props as TProps)}
                    currentUserPersonalDetails={LHNTestUtilsMock.fakePersonalDetails[currentUserAccountID]}
                />
            );
        }

        WrappedComponent.displayName = 'WrappedComponent';

        return WrappedComponent;
    };
});

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';
const betas = [CONST.BETAS.DEFAULT_ROOMS];
const TEST_POLICY_ID = '1';

const signUpWithTestUser = () => {
    TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
};

const getOptionRows = () => {
    return screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
};

const getDisplayNames = () => {
    const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
    return screen.queryAllByLabelText(hintText);
};

// Reusable function to setup a mock report. Feel free to add more parameters as needed.
const createReport = (
    isPinned = false,
    participants = [1, 2],
    messageCount = 1,
    chatType: ValueOf<typeof CONST.REPORT.CHAT_TYPE> | undefined = undefined,
    policyID: string = CONST.POLICY.ID_FAKE,
    isUnread = false,
) => {
    return {
        ...LHNTestUtils.getFakeReport(participants, messageCount, isUnread),
        isPinned,
        chatType,
        policyID,
    };
};

const createFakeTransactionViolation = (violationName: ViolationName = CONST.VIOLATIONS.HOLD, showInReview = true) => {
    return LHNTestUtils.getFakeTransactionViolation(violationName, showInReview);
};

describe('SidebarLinksData', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        initOnyxDerivedValues();
    });

    // Helper to initialize common state
    const initializeState = async (reportData?: ReportCollectionDataSet, otherData?: OnyxMultiSetInput) => {
        await waitForBatchedUpdates();
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                [ONYXKEYS.BETAS]: betas,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                [ONYXKEYS.IS_LOADING_APP]: false,
                ...(reportData ?? {}),
                ...(otherData ?? {}),
            });
        });

        await waitForBatchedUpdatesWithAct();
    };

    beforeEach(async () => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        // Initialize the network key for OfflineWithFeedback
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });

        await waitForBatchedUpdatesWithAct();

        signUpWithTestUser();

        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    describe('Report that should be included in the LHN', () => {
        it('should display the current active report', async () => {
            // Given the SidebarLinks are rendered without a specified report ID.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = createReport();

            // When the Onyx state is initialized with a report.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then no other reports should be displayed in the sidebar.
            expect(getOptionRows()).toHaveLength(0);

            // When the SidebarLinks are rendered again with the current active report ID.
            await LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID);

            await waitForBatchedUpdatesWithAct();
            // Then the active report should be displayed as part of LHN,
            expect(getOptionRows()).toHaveLength(1);

            // And the active report should be highlighted.
            // TODO add the proper assertion for the highlighted report.
        });

        it('should display draft report', async () => {
            // Given SidebarLinks are rendered initially.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const draftReport = {
                ...createReport(false, [1, 2], 0),
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
            };

            // When Onyx state is initialized with a draft report.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${draftReport.reportID}`]: draftReport,
            });

            await waitForBatchedUpdatesWithAct();

            // And a draft message is added to the report.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${draftReport.reportID}`, 'draft report message');
            });

            await waitForBatchedUpdatesWithAct();

            // Then the sidebar should display the draft report.
            expect(getDisplayNames()).toHaveLength(1);

            // And the draft icon should be shown, indicating there is unsent content.
            expect(screen.getByTestId('Pencil Icon', {includeHiddenElements: true})).toBeOnTheScreen();
        });

        it('should display pinned report', async () => {
            // Given the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = createReport(false);

            // When the report is initialized in Onyx.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then the report should not appear in the sidebar as it is not pinned.
            expect(getOptionRows()).toHaveLength(0);
            await waitForBatchedUpdatesWithAct();

            // When the report is marked as pinned.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isPinned: true});
            });

            await waitForBatchedUpdatesWithAct();

            // Then the report should appear in the sidebar because it’s pinned.
            expect(getOptionRows()).toHaveLength(1);

            // And the pin icon should be shown
            expect(screen.getByTestId('Pin Icon', {includeHiddenElements: true})).toBeOnTheScreen();
        });

        it('should display the report with violations', async () => {
            // Given the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // When the report is initialized in Onyx.
            const report: Report = {
                ...createReport(true, undefined, undefined, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, TEST_POLICY_ID),
                ownerAccountID: TEST_USER_ACCOUNT_ID,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
            };

            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            await waitForBatchedUpdatesWithAct();

            // Then the report should appear in the sidebar because it’s pinned.
            expect(getOptionRows()).toHaveLength(1);

            const expenseReport: Report = {
                ...createReport(false, undefined, undefined, undefined, TEST_POLICY_ID),
                ownerAccountID: TEST_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                chatReportID: report.reportID,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
            };
            const transaction = LHNTestUtils.getFakeTransaction(expenseReport.reportID);
            const transactionViolation = createFakeTransactionViolation();
            const reportAction = LHNTestUtils.getFakeAdvancedReportAction();

            // When the report has outstanding violations
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [reportAction.reportActionID]: reportAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`, [transactionViolation]);
            });

            await waitForBatchedUpdatesWithAct();

            // Then the RBR icon should be shown
            expect(screen.getByTestId('RBR Icon', {includeHiddenElements: true})).toBeOnTheScreen();
        });

        it('should display the report awaiting user action', async () => {
            // Given the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report: Report = {
                ...createReport(false),
                hasOutstandingChildRequest: true,
            };

            // When the report is initialized in Onyx.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            await waitForBatchedUpdatesWithAct();

            // Then the report should appear in the sidebar because it requires attention from the user
            expect(getOptionRows()).toHaveLength(1);

            // And a green dot icon should be shown
            expect(screen.getByTestId('GBR Icon', {includeHiddenElements: true})).toBeOnTheScreen();
        });

        it('should display the archived report in the default mode', async () => {
            // Given the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const archivedReport: Report = {
                ...createReport(false),
            };
            const reportNameValuePairs = {
                type: 'chat',
                private_isArchived: DateUtils.getDBTime(),
            };

            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${archivedReport.reportID}`]: archivedReport,
            });

            await waitForBatchedUpdatesWithAct();

            // When the user is in the default mode
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.DEFAULT);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`, reportNameValuePairs);
            });

            await waitForBatchedUpdatesWithAct();

            // Then the report should appear in the sidebar because it's archived
            expect(getOptionRows()).toHaveLength(1);
        });

        it('should display the selfDM report by default', async () => {
            // Given the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = createReport(true, undefined, undefined, undefined, CONST.REPORT.CHAT_TYPE.SELF_DM, undefined);

            // When the selfDM is initialized in Onyx
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            await waitForBatchedUpdatesWithAct();

            // Then the selfDM report should appear in the sidebar by default
            expect(getOptionRows()).toHaveLength(1);
        });

        it('should display the unread report in the focus mode with the bold text', async () => {
            // Given the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report: Report = {
                ...createReport(undefined, undefined, undefined, undefined, undefined, true),
                lastMessageText: 'fake last message',
                lastActorAccountID: TEST_USER_ACCOUNT_ID,
            };

            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            await waitForBatchedUpdatesWithAct();

            // When the user is in focus mode
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.GSD);
            });

            await waitForBatchedUpdatesWithAct();

            // Then the report should appear in the sidebar because it's unread
            expect(getOptionRows()).toHaveLength(1);

            // And the text is bold
            const displayNameText = getDisplayNames()?.at(0);
            expect(displayNameText).toHaveStyle({fontWeight: FontUtils.fontWeight.bold});

            await waitForBatchedUpdatesWithAct();

            // When the report is marked as read
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {
                    lastReadTime: report.lastVisibleActionCreated,
                });
            });

            await waitForBatchedUpdatesWithAct();

            // Then the report should not disappear in the sidebar because we are in the focus mode
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not change the current user personal detail when a report with last action is REPORTPREVIEW is displayed', async () => {
            // Given the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            const report: Report = {
                ...createReport(undefined, [1, 2], undefined, undefined, undefined, true),
                lastActorAccountID: 1,
                lastMessageText: '123456',
            };

            const lastReportAction: ReportAction = {
                ...createRandomReportAction(2),
                actionName: 'REPORTPREVIEW',
                actorAccountID: 2,
                message: [],
                originalMessage: undefined,
                person: [
                    {
                        type: 'TEXT',
                        style: 'strong',
                        text: TEST_USER_LOGIN,
                    },
                ],
            };

            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            await waitForBatchedUpdatesWithAct();

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[lastReportAction.reportActionID]: lastReportAction});

            await waitForBatchedUpdatesWithAct();

            const personalDetail = await getOnyxValue(ONYXKEYS.PERSONAL_DETAILS_LIST);
            expect(personalDetail?.[TEST_USER_ACCOUNT_ID]?.accountID).toBe(TEST_USER_ACCOUNT_ID);
        });
    });

    describe('Report that should NOT be included in the LHN', () => {
        it('should not display report with no participants', async () => {
            // Given the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = LHNTestUtils.getFakeReport([]);

            // When a report with no participants is initialized in Onyx.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then the report should not appear in the sidebar.
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display empty chat', async () => {
            // Given the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = LHNTestUtils.getFakeReport([1, 2], 0);

            // When a report with no messages is initialized in Onyx
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then the empty report should not appear in the sidebar.
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display the report marked as hidden', async () => {
            // Given the SidebarLinks are rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report: Report = {
                ...createReport(),
                participants: {
                    [TEST_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
            };

            // When a report with notification preference set as hidden is initialized in Onyx
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then hidden report should not appear in the sidebar.
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display the report has empty notification preference', async () => {
            // Given the SidebarLinks are rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = createReport(false, [2]);

            // When a report with empty notification preference is initialized in Onyx
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then the report should not appear in the sidebar.
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display the report the user cannot access due to policy restrictions', async () => {
            // Given the SidebarLinks are rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report: Report = {
                ...createReport(),
                chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
                lastMessageText: 'fake last message',
            };

            // When a default room is initialized in Onyx
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // And the defaultRooms beta is removed
            await act(async () => {
                await Onyx.merge(ONYXKEYS.BETAS, []);
            });

            await waitForBatchedUpdatesWithAct();

            // Then the default room should not appear in the sidebar.
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display the single transaction thread', async () => {
            // Given the SidebarLinks are rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const expenseReport = buildOptimisticExpenseReport({chatReportID: chatReportR14932.reportID, policyID: '123', payeeAccountID: 100, total: 122, currency: 'USD', betas: [CONST.BETAS.ALL]});
            const expenseTransaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: expenseReport.reportID,
                },
            });
            const expenseCreatedAction = buildOptimisticIOUReportAction({
                type: 'create',
                amount: 100,
                currency: 'USD',
                comment: '',
                participants: [],
                transactionID: expenseTransaction.transactionID,
                iouReportID: expenseReport.reportID,
            });
            const transactionThreadReport = buildTransactionThread(expenseCreatedAction, expenseReport);
            expenseCreatedAction.childReportID = transactionThreadReport.reportID;

            // When a single transaction thread is initialized in Onyx
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`]: transactionThreadReport,
            });

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportR14932.reportID}`, chatReportR14932);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                    [expenseCreatedAction.reportActionID]: expenseCreatedAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${expenseTransaction.transactionID}`, expenseTransaction);
            });

            await waitForBatchedUpdatesWithAct();

            // Then such report should not appear in the sidebar because the highest level context is on the expense chat with GBR that is visible in the LHN
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display the report with parent message is pending removal', async () => {
            // Given the SidebarLinks are rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const parentReport = createReport();
            const report = createReport();
            const parentReportAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                message: [
                    {
                        type: 'COMMENT',
                        html: 'hey',
                        text: 'hey',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                        moderationDecision: {
                            decision: CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE,
                        },
                    },
                ],
                childReportID: report.reportID,
            };
            report.parentReportID = parentReport.reportID;
            report.parentReportActionID = parentReportAction.reportActionID;

            // When a report with parent message is pending removal is initialized in Onyx
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`, parentReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport.reportID}`, {
                    [parentReportAction.reportActionID]: parentReportAction,
                });
            });

            await waitForBatchedUpdatesWithAct();

            // Then report should not appear in the sidebar until the moderation feature decides if the message should be removed
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display the read report in the focus mode', async () => {
            // Given the SidebarLinks are rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report: Report = {
                ...createReport(),
                lastMessageText: 'fake last message',
                lastActorAccountID: TEST_USER_ACCOUNT_ID,
            };

            // When a read report that isn't empty is initialized in Onyx
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            await waitForBatchedUpdatesWithAct();

            // And the user is in default mode
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.DEFAULT);
            });

            await waitForBatchedUpdatesWithAct();

            // Then the report should appear in the sidebar
            expect(getOptionRows()).toHaveLength(1);

            await act(async () => {
                // When the user is in focus mode
                await Onyx.merge(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.GSD);
            });

            await waitForBatchedUpdatesWithAct();

            // Then the report should not disappear in the sidebar because it's read
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display an empty submitted report having only a CREATED action', async () => {
            // Given the SidebarLinks are rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // When creating a report with total = 0, stateNum = SUBMITTED, statusNum = SUBMITTED
            const report = {
                ...createReport(false, [1, 2], 0),
                total: 0,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            // And setting up a report action collection with only a CREATED action
            const reportActionID = '1';
            const reportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                reportActionID,
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
            };

            // When the Onyx state is initialized with this report
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            await act(async () => {
                // And a report action collection with only a CREATED action is added
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [reportActionID]: reportAction,
                });
            });

            await waitForBatchedUpdatesWithAct();

            // Then the report should not be displayed in the sidebar
            expect(getOptionRows()).toHaveLength(0);
            expect(getDisplayNames()).toHaveLength(0);
        });
    });

    describe('Inbox - GBR', () => {
        it('should display the report with GBR when the report has outstanding child task', async () => {
            // Given SidebarLinks are rendered initially.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const reportWithOutstandingChildTask: Report = {
                ...createReport(false, [1, 2], 0),
                hasOutstandingChildTask: true,
            };

            // When Onyx state is initialized with a draft report.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${reportWithOutstandingChildTask.reportID}`]: reportWithOutstandingChildTask,
            });

            await waitForBatchedUpdatesWithAct();

            // Then the sidebar should display the outstanding report.
            expect(getDisplayNames()).toHaveLength(1);

            // And the GBR icon should be shown, indicating there is require action from current user.
            expect(screen.getByTestId('GBR Icon', {includeHiddenElements: true})).toBeOnTheScreen();
        });

        it('should display the report with GRB when the report has unread mention', async () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const reportWithUnreadMention: Report = {
                ...createReport(false, [1, 2], 0),
                lastReadTime: '2025-01-01 00:00:00',
                lastMentionedTime: '2025-01-01 00:00:01',
            };

            // When Onyx state is initialized with a draft report.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${reportWithUnreadMention.reportID}`]: reportWithUnreadMention,
            });

            await waitForBatchedUpdatesWithAct();

            // Then the sidebar should display the report with unread mention.
            expect(getDisplayNames()).toHaveLength(1);

            // And the GRB icon should be shown, indicating there is unread mention.
            expect(screen.getByTestId('GBR Icon', {includeHiddenElements: true})).toBeOnTheScreen();
        });
    });
});
