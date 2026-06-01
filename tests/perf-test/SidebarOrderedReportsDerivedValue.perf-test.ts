import {rand} from '@ngneat/falso';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import type {DerivedValueContext} from '@libs/actions/OnyxDerived/types';
import CONST from '@src/CONST';
import sidebarOrderedReportsConfig from '@src/libs/actions/OnyxDerived/configs/sidebarOrderedReports';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Network, ReportAttributesDerivedValue} from '@src/types/onyx';
import type PriorityMode from '@src/types/onyx/PriorityMode';
import type Report from '@src/types/onyx/Report';
import createCollection from '../utils/collections/createCollection';
import {getRandomDate} from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type ConfigArgs = Parameters<typeof sidebarOrderedReportsConfig.compute>[0];

const REPORTS_COUNT = 15000;
const REPORT_THRESHOLD = 5;
const SOURCE_UPDATE_BATCH = 10;

const allReports: OnyxCollection<Report> = createCollection<Report>(
    (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
    (index) => ({
        ...createRandomReport(index, undefined),
        type: rand(Object.values(CONST.REPORT.TYPE)),
        lastVisibleActionCreated: getRandomDate(),
        statusNum: index % REPORT_THRESHOLD ? 0 : CONST.REPORT.STATUS_NUM.CLOSED,
        stateNum: index % REPORT_THRESHOLD ? 0 : CONST.REPORT.STATE_NUM.APPROVED,
        isUnreadWithMention: false,
    }),
    REPORTS_COUNT,
);

const mockedBetas: Beta[] = Object.values(CONST.BETAS) as Beta[];
const defaultPriorityMode = CONST.PRIORITY_MODE.DEFAULT as PriorityMode;
const network: Network = {};
const locale = 'en';

const EMPTY_CONTEXT: DerivedValueContext<typeof sidebarOrderedReportsConfig.key, typeof sidebarOrderedReportsConfig.dependencies> = {
    currentValue: undefined,
    sourceValues: undefined,
};

function buildArgs(reportAttributes?: ReportAttributesDerivedValue): ConfigArgs {
    return [allReports, undefined, undefined, undefined, undefined, undefined, defaultPriorityMode, mockedBetas, network, locale, reportAttributes] as unknown as ConfigArgs;
}

function buildReportAttributes(): ReportAttributesDerivedValue {
    const reports: ReportAttributesDerivedValue['reports'] = {};
    for (const key of Object.keys(allReports ?? {})) {
        const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT, '');
        reports[reportID] = {
            reportName: `Report ${reportID}`,
            isEmpty: false,
            brickRoadStatus: undefined,
            requiresAttention: false,
            reportErrors: {},
        };
    }
    return {reports, locale};
}

describe('SidebarOrderedReports derived value', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        Onyx.multiSet({[ONYXKEYS.NVP_PREFERRED_LOCALE]: 'en'});
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[sidebarOrderedReports] full compute, 15k reports, DEFAULT priorityMode', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => sidebarOrderedReportsConfig.compute(buildArgs(), EMPTY_CONTEXT));
    });

    test('[sidebarOrderedReports] full compute, 15k reports, GSD priorityMode', async () => {
        await waitForBatchedUpdates();
        const args = buildArgs();
        args[6] = CONST.PRIORITY_MODE.GSD as PriorityMode;
        await measureFunction(() => sidebarOrderedReportsConfig.compute(args, EMPTY_CONTEXT));
    });

    test('[sidebarOrderedReports] incremental compute, 15k reports, ~10 changed', async () => {
        await waitForBatchedUpdates();
        const seeded = sidebarOrderedReportsConfig.compute(buildArgs(), EMPTY_CONTEXT);
        const reportKeys = Object.keys(allReports ?? {}).slice(0, SOURCE_UPDATE_BATCH);
        const sourceValue: Record<string, Report | undefined> = {};
        for (const key of reportKeys) {
            sourceValue[key] = allReports?.[key];
        }

        await measureFunction(() =>
            sidebarOrderedReportsConfig.compute(buildArgs(), {
                currentValue: seeded,
                sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: sourceValue},
            }),
        );
    });

    // A REPORT_ATTRIBUTES change is diffed against the previous snapshot, so only the changed reports are
    // re-evaluated via the incremental path instead of triggering a full recompute.
    test('[sidebarOrderedReports] report attributes update, 15k reports, ~10 changed', async () => {
        await waitForBatchedUpdates();
        const seededAttributes = buildReportAttributes();
        const seededArgs = buildArgs(seededAttributes);
        const seeded = sidebarOrderedReportsConfig.compute(seededArgs, EMPTY_CONTEXT);

        // Give ~10 reports a new attributes reference so the diff against the snapshot yields exactly those reports.
        const updatedReports: ReportAttributesDerivedValue['reports'] = {...seededAttributes.reports};
        for (const reportID of Object.keys(seededAttributes.reports).slice(0, SOURCE_UPDATE_BATCH)) {
            updatedReports[reportID] = {...seededAttributes.reports[reportID], requiresAttention: true};
        }
        const updatedAttributes: ReportAttributesDerivedValue = {reports: updatedReports, locale};
        const updatedArgs = buildArgs(updatedAttributes);

        // DerivedSourceValues only types collection deltas, but the framework passes any changed
        // dependency's value at runtime, so we cast to feed the non-collection REPORT_ATTRIBUTES source.
        const context = {
            currentValue: seeded,
            sourceValues: {[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: updatedAttributes},
        } as unknown as typeof EMPTY_CONTEXT;

        await measureFunction(() => sidebarOrderedReportsConfig.compute(updatedArgs, context), {
            // The compute overwrites the module-level attributes snapshot, so reset it to the seeded baseline before
            // each run (this runs outside the measured section) so every measured compute diffs the same ~10 reports.
            beforeEach: () => {
                sidebarOrderedReportsConfig.compute(seededArgs, EMPTY_CONTEXT);
            },
        });
    });
});
