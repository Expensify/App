import type * as Navigation from '@react-navigation/native';
import {fireEvent, screen, waitFor} from '@testing-library/react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxValues} from '@src/ONYXKEYS';
import type {PersonalDetails, Report, ReportActions, ReportMetadata, ReportNameValuePairs} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@libs/Permissions');
jest.mock('../../src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isActiveRoute: jest.fn(),
    getTopmostReportId: jest.fn(),
    getActiveRoute: jest.fn(),
    getTopmostReportActionId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
}));
jest.mock('../../src/libs/Navigation/navigationRef', () => ({
    getState: () => ({
        routes: [{name: 'Report'}],
    }),
    getRootState: () => ({
        routes: [],
    }),
    addListener: () => () => {},
    isReady: () => true,
}));
jest.mock('@components/Icon/Expensicons');
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');

    return {
        ...actualNav,
        useNavigationState: () => true,
        useRoute: jest.fn(),
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: jest.fn(),
        }),
        createNavigationContainerRef: jest.fn(),
    };
});
jest.mock('@src/hooks/useLHNEstimatedListSize/index.native.ts');

const getMockedReportsMap = (length = 100) => {
    const mockReports = Object.fromEntries(
        Array.from({length}, (value, index) => {
            const reportID = index + 1;
            const participants = [1, 2];
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            const report = {...LHNTestUtils.getFakeReport(participants, 1, true), lastMessageText: 'hey'};

            return [reportKey, report];
        }),
    );

    return mockReports;
};

const mockedResponseMap = getMockedReportsMap(500);

const REPORTS_COUNT = 150;
const ACTIONS_PER_REPORT = 50;

const createMockReportActions = (reportID: string, count: number): ReportActions => {
    const actions: ReportActions = {};
    for (let i = 0; i < count; i++) {
        actions[`${reportID}_${i}`] = createRandomReportAction(i);
    }
    return actions;
};

const createReportsWithActions = (count: number) => {
    const reports: OnyxCollection<Report> = {};
    const reportActions: OnyxCollection<ReportActions> = {};
    const reportNameValuePairs: OnyxCollection<ReportNameValuePairs> = {};
    const policies: OnyxCollection<Policy> = {};
    const personalDetails: OnyxCollection<PersonalDetails> = {};
    const reportMetadata: OnyxCollection<ReportMetadata> = {};

    const basePolicy = createRandomPolicy(1);
    policies[`${ONYXKEYS.COLLECTION.POLICY}${basePolicy.id}`] = basePolicy;

    for (let i = 1; i <= count; i++) {
        const reportID = String(i);
        const report = createRandomReport(i, undefined);

        const isArchived = i % 10 === 0;
        const reportTypeMod = i % 4;
        let reportType: string;
        if (reportTypeMod === 0) {
            reportType = CONST.REPORT.TYPE.IOU;
        } else if (reportTypeMod === 1) {
            reportType = CONST.REPORT.TYPE.EXPENSE;
        } else {
            reportType = CONST.REPORT.TYPE.CHAT;
        }

        reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
            ...report,
            type: reportType,
        };
        reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = createMockReportActions(reportID, ACTIONS_PER_REPORT);
        reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`] = {
            private_isArchived: isArchived ? 'true' : 'false',
        };

        const lastActorAccountID = report.lastActorAccountID ?? i;
        personalDetails[String(lastActorAccountID)] = createPersonalDetails(lastActorAccountID);

        if (i % 5 === 0) {
            reportMetadata[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`] = {
                lastVisitTime: new Date().toISOString(),
            };
        }
    }

    return {
        reports,
        reportActions,
        reportNameValuePairs,
        policies,
        personalDetails,
        reportMetadata,
    };
};

describe('SidebarLinks', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);

        // Initialize the network key for OfflineWithFeedback
        Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
        TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One').then(waitForBatchedUpdates);
    });

    afterEach(() => {
        Onyx.clear();
    });

    test('[SidebarLinks] should render Sidebar with 500 reports stored', async () => {
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');
        };

        await waitForBatchedUpdates();

        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...mockedResponseMap,
        });

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks] should click on list item', async () => {
        const scenario = async () => {
            // Wait for the sidebar container to be rendered first
            await waitFor(async () => {
                await screen.findByTestId('lhn-options-list');
            });

            // Then wait for the specific list item to be available
            const button = await screen.findByTestId('1');
            fireEvent.press(button);
        };
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...mockedResponseMap,
        });

        // Wait for Onyx to process the data
        await waitForBatchedUpdates();

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks LHN] initial render with 150 reports and actions', async () => {
        const {reports, reportActions, reportNameValuePairs, policies, personalDetails, reportMetadata} = createReportsWithActions(REPORTS_COUNT);

        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');
        };

        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...reports,
            ...reportActions,
            ...reportNameValuePairs,
            ...policies,
            ...reportMetadata,
        } as Partial<OnyxValues>);

        await waitForBatchedUpdatesWithAct();

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks LHN] re-render when single report action changes', async () => {
        const {reports, reportActions, reportNameValuePairs, policies, personalDetails, reportMetadata} = createReportsWithActions(REPORTS_COUNT);

        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...reports,
            ...reportActions,
            ...reportNameValuePairs,
            ...policies,
            ...reportMetadata,
        } as Partial<OnyxValues>);

        await waitForBatchedUpdates();

        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');
            const firstReportID = '1';
            const firstReportActions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${firstReportID}`];
            if (firstReportActions) {
                const newAction = createRandomReportAction(999);
                const updatedActions = {
                    ...firstReportActions,
                    [`${firstReportID}_999`]: newAction,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${firstReportID}`, updatedActions);
                await waitForBatchedUpdatesWithAct();
            }
        };

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks LHN] re-render when multiple reports change', async () => {
        const {reports, reportActions, reportNameValuePairs, policies, personalDetails, reportMetadata} = createReportsWithActions(REPORTS_COUNT);

        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...reports,
            ...reportActions,
            ...reportNameValuePairs,
            ...policies,
            ...reportMetadata,
        } as Partial<OnyxValues>);

        await waitForBatchedUpdates();

        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');
            const updates: Record<string, ReportActions> = {};
            for (let i = 1; i <= 10; i++) {
                const reportID = String(i);
                const existingActions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
                if (existingActions) {
                    const newAction = createRandomReportAction(1000 + i);
                    updates[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = {
                        ...existingActions,
                        [`${reportID}_new`]: newAction,
                    };
                }
            }
            await Onyx.multiSet(updates as Partial<OnyxValues>);
            await waitForBatchedUpdatesWithAct();
        };

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks LHN] re-render when report metadata changes', async () => {
        const {reports, reportActions, reportNameValuePairs, policies, personalDetails, reportMetadata} = createReportsWithActions(REPORTS_COUNT);

        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...reports,
            ...reportActions,
            ...reportNameValuePairs,
            ...policies,
            ...reportMetadata,
        } as Partial<OnyxValues>);

        await waitForBatchedUpdates();

        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');
            const firstReportID = '1';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${firstReportID}`, {
                lastVisitTime: new Date().toISOString(),
            });
            await waitForBatchedUpdatesWithAct();
        };

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks LHN] re-render when report archived status changes', async () => {
        const {reports, reportActions, reportNameValuePairs, policies, personalDetails, reportMetadata} = createReportsWithActions(REPORTS_COUNT);

        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...reports,
            ...reportActions,
            ...reportNameValuePairs,
            ...policies,
            ...reportMetadata,
        } as Partial<OnyxValues>);

        await waitForBatchedUpdates();

        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');
            const firstReportID = '1';
            const currentArchivedStatus = reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${firstReportID}`]?.private_isArchived;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${firstReportID}`, {
                private_isArchived: currentArchivedStatus === 'true' ? 'false' : 'true',
            });
            await waitForBatchedUpdatesWithAct();
        };

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks LHN] scaling test – initial render with 500 reports', async () => {
        const {reports, reportActions, reportNameValuePairs, policies, personalDetails, reportMetadata} = createReportsWithActions(500);

        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');
        };

        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...reports,
            ...reportActions,
            ...reportNameValuePairs,
            ...policies,
            ...reportMetadata,
        } as Partial<OnyxValues>);

        await waitForBatchedUpdatesWithAct();

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });
});
