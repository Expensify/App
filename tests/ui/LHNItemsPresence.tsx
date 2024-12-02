import {screen} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ViolationName} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

// Be sure to include the mocked permissions library, as some components that are rendered
// during the test depend on its methods.
jest.mock('@libs/Permissions');
jest.mock('@src/hooks/useActiveWorkspaceFromNavigationState');

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
    const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
    return screen.queryAllByAccessibilityHint(hintText);
};

const getDisplayNames = () => {
    const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
    return screen.queryAllByLabelText(hintText);
};

// Reusable function to setup a mock report. Feel free to add more parameters as needed.
const createReport = (
    isPinned = false,
    participants = [1, 2],
    messageCount = 1,
    chatType: ValueOf<typeof CONST.REPORT.CHAT_TYPE> | undefined = undefined,
    policyID: string = CONST.POLICY.ID_FAKE,
) => {
    return {
        ...LHNTestUtils.getFakeReport(participants, messageCount),
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
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    // Helper to initialize common state
    const initializeState = async (reportData?: ReportCollectionDataSet, otherData?: OnyxMultiSetInput) => {
        await waitForBatchedUpdates();
        await Onyx.multiSet({
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.BETAS]: betas,
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.IS_LOADING_APP]: false,
            ...(reportData ?? {}),
            ...(otherData ?? {}),
        });
    };

    beforeEach(() => {
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        // Initialize the network key for OfflineWithFeedback
        Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
        signUpWithTestUser();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    describe('Report that should be included in the LHN', () => {
        it('should display the current active report', async () => {
            // When the SidebarLinks are rendered without a specified report ID.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = createReport();

            // And the Onyx state is initialized with a report.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then no other reports should be displayed in the sidebar.
            expect(getOptionRows()).toHaveLength(0);

            // When the SidebarLinks are rendered again with the current active report ID.
            LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID);

            // Then the active report should be displayed as part of LHN,
            expect(getOptionRows()).toHaveLength(1);

            // And the active report should be highlighted.
            // TODO add the proper assertion for the highlighted report.
        });

        it('should display draft report', async () => {
            // When SidebarLinks are rendered initially.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const draftReport = {
                ...createReport(false, [1, 2], 0),
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
            };

            // And Onyx state is initialized with a draft report.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${draftReport.reportID}`]: draftReport,
            });

            await waitForBatchedUpdatesWithAct();

            // And a draft message is added to the report.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${draftReport.reportID}`, 'draft report message');

            // Then the sidebar should display the draft report.
            expect(getDisplayNames()).toHaveLength(1);

            // And the draft icon should be shown, indicating there is unsent content.
            expect(screen.getByTestId('Pencil Icon')).toBeOnTheScreen();
        });

        it('should display pinned report', async () => {
            // When the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = createReport(false);

            // And the report is initialized in Onyx.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then the report should not appear in the sidebar as it is not pinned.
            expect(getOptionRows()).toHaveLength(0);
            await waitForBatchedUpdatesWithAct();

            // When the report is marked as pinned.
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isPinned: true});

            // Then the report should appear in the sidebar because it’s pinned.
            expect(getOptionRows()).toHaveLength(1);

            // And the pin icon should be shown
            expect(screen.getByTestId('Pin Icon')).toBeOnTheScreen();
        });

        it('should display the report with violations', async () => {
            // When the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // And the report is initialized in Onyx.
            const report: Report = {
                ...createReport(true, undefined, undefined, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, TEST_POLICY_ID),
                ownerAccountID: TEST_USER_ACCOUNT_ID,
            };

            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // The report should appear in the sidebar because it’s pinned.
            expect(getOptionRows()).toHaveLength(1);
            await waitForBatchedUpdatesWithAct();

            const expenseReport: Report = {
                ...createReport(false, undefined, undefined, undefined, TEST_POLICY_ID),
                ownerAccountID: TEST_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            const transaction = LHNTestUtils.getFakeTransaction(expenseReport.reportID);
            const transactionViolation = createFakeTransactionViolation();

            // When the report has outstanding violations
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`, [transactionViolation]);

            // The RBR icon should be shown
            expect(screen.getByTestId('RBR Icon')).toBeOnTheScreen();
        });

        it('should display the report with needing user action', async () => {
            // When the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report: Report = {
                ...createReport(false),
                hasOutstandingChildRequest: true,
            };

            // And the report is initialized in Onyx.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then the report should appear in the sidebar because it requires attention from the user
            expect(getOptionRows()).toHaveLength(1);

            // And a green dot icon should be shown
            expect(screen.getByTestId('GBR Icon')).toBeOnTheScreen();
        });
    });

    describe('Report that should NOT be included in the LHN', () => {
        it('should not display report with no participants', async () => {
            // When the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = LHNTestUtils.getFakeReport([]);

            // And a report with no participants is initialized in Onyx.
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then the report should not appear in the sidebar.
            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display empty chat', async () => {
            // When the SidebarLinks are rendered.
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = LHNTestUtils.getFakeReport([1, 2], 0);

            // And a report with no messages is initialized in Onyx
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // Then the empty report should not appear in the sidebar.
            expect(getOptionRows()).toHaveLength(0);
        });
    });
});
