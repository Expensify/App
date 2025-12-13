import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import type {UpdateContext} from '@libs/OptimisticReportNames';
import {computeReportNameIfNeeded} from '@libs/OptimisticReportNames';
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportUtils to mock
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock dependencies
jest.mock('@libs/ReportUtils', () => ({
    // jest.requireActual is necessary to include multi-layered module imports (eg. Report.ts has processReportIDDeeplink() which uses parseReportRouteParams() imported from getReportIDFromUrl.ts)
    // Without jest.requireActual, parseReportRouteParams would be undefined, causing the test to fail.
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    // These methods are mocked below in the beforeAll function to return specific values
    isExpenseReport: jest.fn(),
    getTitleReportField: jest.fn(),
}));
jest.mock('@libs/Log', () => ({
    info: jest.fn(),
}));

const mockReportUtils = ReportUtils as jest.Mocked<typeof ReportUtils>;

describe('[OptimisticReportNames] Performance Tests', () => {
    const REPORTS_COUNT = 1000;
    const POLICIES_COUNT = 100;

    const mockPolicy = {
        id: 'policy1',
        name: 'Test Policy',
        fieldList: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            text_title: {
                defaultValue: '{report:type} - {report:startdate} - {report:total} {report:currency}',
            },
        },
    } as unknown as Policy;

    const mockPolicies = createCollection<Policy>(
        (item) => `policy_${item.id}`,
        (index) => ({
            ...mockPolicy,
            id: `policy${index}`,
            name: `Policy ${index}`,
        }),
        POLICIES_COUNT,
    );

    const mockReports = createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => ({
            ...createRandomReport(index, undefined),
            policyID: `policy${index % POLICIES_COUNT}`,
            total: -(Math.random() * 100000), // Random negative amount
            currency: 'USD',
            lastVisibleActionCreated: new Date().toISOString(),
        }),
        REPORTS_COUNT,
    );

    const mockContext: UpdateContext = {
        betas: [CONST.BETAS.CUSTOM_REPORT_NAMES],
        betaConfiguration: {},
        allReports: mockReports,
        allPolicies: mockPolicies,
        allReportNameValuePairs: {},
        allTransactions: {},
        isOffline: false,
    };

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        mockReportUtils.isExpenseReport.mockReturnValue(true);
        mockReportUtils.getTitleReportField.mockReturnValue(mockPolicy.fieldList?.text_title);
        await waitForBatchedUpdates();
    });

    afterAll(() => {
        Onyx.clear();
    });

    describe('Single Report Name Computation', () => {
        test('[OptimisticReportNames] computeReportNameIfNeeded() single report', async () => {
            const report = Object.values(mockReports).at(0);
            const update = {
                key: `report_${report?.reportID}` as OnyxKey,
                onyxMethod: Onyx.METHOD.MERGE,
                value: {total: -20000},
            };

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            await measureFunction(() => computeReportNameIfNeeded(report, update, mockContext));
        });
    });
});
