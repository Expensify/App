import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, ReportActions, TransactionViolation} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const getMockedReports = (length = 500) =>
    createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index),
        length,
    );

const reportActions = createCollection<ReportAction>(
    (item) => `${item.reportActionID}`,
    (index) => createRandomReportAction(index),
);

const personalDetails = createCollection<PersonalDetails>(
    (item) => item.accountID,
    (index) => createPersonalDetails(index),
);

const mockedResponseMap = getMockedReports(1000) as Record<`${typeof ONYXKEYS.COLLECTION.REPORT}`, Report>;

describe('SidebarUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        Onyx.multiSet({
            ...mockedResponseMap,
        });
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[SidebarUtils] getOptionData on 1k reports', async () => {
        const report = createRandomReport(1);
        const preferredLocale = 'en';
        const policy = createRandomPolicy(1);
        const parentReportAction = createRandomReportAction(1);

        await waitForBatchedUpdates();

        await measureFunction(() =>
            SidebarUtils.getOptionData({
                report,
                personalDetails,
                preferredLocale,
                policy,
                parentReportAction,
                reportErrors: undefined,
                hasViolations: false,
            }),
        );
    });

    test('[SidebarUtils] getOrderedReportIDs on 1k reports', async () => {
        const currentReportId = '1';
        const allReports = getMockedReports();
        const betas = [CONST.BETAS.DEFAULT_ROOMS];
        const transactionViolations = {} as OnyxCollection<TransactionViolation[]>;

        const policies = createCollection<Policy>(
            (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
            (index) => createRandomPolicy(index),
        );

        const allReportActions = Object.fromEntries(
            Object.keys(reportActions).map((key) => [
                key,
                {
                    [reportActions[key].reportActionID]: {
                        errors: reportActions[key].errors ?? [],
                        message: [
                            {
                                moderationDecision: {
                                    decision: reportActions[key].message?.[0]?.moderationDecision?.decision,
                                },
                            },
                        ],
                    },
                },
            ]),
        ) as unknown as OnyxCollection<ReportActions>;

        const reportKeys = Object.keys(allReports);
        const reportIDsWithErrors = reportKeys.reduce((errorsMap, reportKey) => {
            const report = allReports[reportKey];
            const allReportsActions = allReportActions?.[reportKey.replace('report_', 'reportActions_')] ?? null;
            const errors = OptionsListUtils.getAllReportErrors(report, allReportsActions) || {};
            if (isEmptyObject(errors)) {
                return errorsMap;
            }
            return {...errorsMap, [reportKey.replace('report_', '')]: errors};
        }, {});

        await waitForBatchedUpdates();
        await measureFunction(() =>
            SidebarUtils.getOrderedReportIDs(
                currentReportId,
                allReports,
                betas,
                policies,
                CONST.PRIORITY_MODE.DEFAULT,
                allReportActions,
                transactionViolations,
                undefined,
                undefined,
                reportIDsWithErrors,
            ),
        );
    });
});
