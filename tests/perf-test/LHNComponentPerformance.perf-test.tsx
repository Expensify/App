import {screen, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {PersonalDetails, Report, ReportActions, ReportMetadata, ReportNameValuePairs} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@libs/Permissions');
jest.mock('@src/languages/IntlStore');
jest.mock('@src/libs/Localize', () => ({
    translate: (_locale: string | undefined, key: string | string[], ..._params: unknown[]) => {
        return Array.isArray(key) ? key.join('.') : key;
    },
    translateLocal: (key: string | string[], ..._params: unknown[]) => {
        return Array.isArray(key) ? key.join('.') : key;
    },
    formatList: (components: string[]) => components.join(', '),
    formatMessageElementList: (elements: unknown[]) => elements,
    getDevicePreferredLocale: () => 'en',
}));
jest.mock('@libs/Localize', () => ({
    translate: (_locale: string | undefined, key: string | string[], ..._params: unknown[]) => {
        return Array.isArray(key) ? key.join('.') : key;
    },
    translateLocal: (key: string | string[], ..._params: unknown[]) => {
        return Array.isArray(key) ? key.join('.') : key;
    },
    formatList: (components: string[]) => components.join(', '),
    formatMessageElementList: (elements: unknown[]) => elements,
    getDevicePreferredLocale: () => 'en',
}));
jest.mock('@src/libs/actions/Session', () => ({
    beginSignIn: jest.fn(),
    signIn: jest.fn(),
}));
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
jest.mock('@react-navigation/native');
jest.mock('@src/hooks/useLHNEstimatedListSize/index.native.ts');

const REPORTS_COUNT = 150;
const ACTIONS_PER_REPORT = 50;

const createMockReportActions = (reportID: string, count: number): ReportActions => {
    const actions: ReportActions = {};
    for (let i = 0; i < count; i++) {
        const action = createRandomReportAction(i);
        actions[`${reportID}_${i}`] = action;
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
        const reportType =
            reportTypeMod === 0 ? CONST.REPORT.TYPE.IOU : reportTypeMod === 1 ? CONST.REPORT.TYPE.EXPENSE : CONST.REPORT.TYPE.CHAT;

        reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
            ...report,
            type: reportType,
        };
        reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = createMockReportActions(reportID, ACTIONS_PER_REPORT);
        reportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`] = {
            private_isArchived: isArchived ? 'true' : 'false',
        };

        const lastActorAccountID = report.lastActorAccountID || i;
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

describe('LHN Component Performance Baseline', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
        await TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One');
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        Onyx.clear();
    });

    test('[LHN Component] Initial render with 150 reports', async () => {
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
        } as any);

        await waitForBatchedUpdatesWithAct();

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[LHN Component] Re-render when single report action changes', async () => {
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
        } as any);

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

    test('[LHN Component] Re-render when multiple reports change', async () => {
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
        } as any);

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
            await Onyx.multiSet(updates);
            await waitForBatchedUpdatesWithAct();
        };

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[LHN Component] Re-render when report metadata changes', async () => {
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
        } as any);

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

    test('[LHN Component] Scaling test - 500 reports initial render', async () => {
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
        } as any);

        await waitForBatchedUpdatesWithAct();

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });
});
