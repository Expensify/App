import {screen} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import Onyx from 'react-native-onyx';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
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
const createReport = (isPinned = false, participants = [1, 2], messageCount = 1) => {
    return {
        ...LHNTestUtils.getFakeReport(participants, messageCount),
        isPinned,
    };
};

describe('SidebarLinksData', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    // Helper to initialize common state
    const initializeState = async (reportData: ReportCollectionDataSet) => {
        await waitForBatchedUpdates();
        await Onyx.multiSet({
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.BETAS]: betas,
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.IS_LOADING_APP]: false,
            ...reportData,
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
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            const report = createReport();

            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });
            // check if no other reports are displayed
            expect(getOptionRows()).toHaveLength(0);

            LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID);

            // check if active report is displayed
            expect(getOptionRows()).toHaveLength(1);
            // TODO The report is highlighted as the active report.
        });

        it('should display draft report', async () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const draftReport = {
                ...createReport(false, [1, 2], 0),
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
            };

            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${draftReport.reportID}`]: draftReport,
            });

            await waitForBatchedUpdatesWithAct();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${draftReport.reportID}`, 'draft report message');

            // check if draft report is displayed
            expect(getDisplayNames()).toHaveLength(1);
            // check if draft icon is displayed
            expect(screen.getByTestId('Pencil Icon')).toBeOnTheScreen();
        });

        it('should display pinned report', async () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = createReport(false);
            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            // report is not pinned
            expect(getOptionRows()).toHaveLength(0);
            await waitForBatchedUpdatesWithAct();

            // pin the report
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isPinned: true});

            // report is pinned
            expect(getOptionRows()).toHaveLength(1);

            // TODO The report is indicated as pinned.
        });
    });

    describe('Report that should NOT be included in the LHN', () => {
        it('should not display report with no participants', async () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = LHNTestUtils.getFakeReport([]);

            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });

            expect(getOptionRows()).toHaveLength(0);
        });

        it('should not display empty chat', async () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            const report = LHNTestUtils.getFakeReport([1, 2], 0);

            await initializeState({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            });
            expect(getOptionRows()).toHaveLength(0);
        });
    });
});
