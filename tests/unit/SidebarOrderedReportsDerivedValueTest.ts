import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {DerivedValueContext} from '@libs/actions/OnyxDerived/types';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import sidebarOrderedReportsConfig from '@src/libs/actions/OnyxDerived/configs/sidebarOrderedReports';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Network, Policy, Report, ReportAttributesDerivedValue} from '@src/types/onyx';
import type PriorityMode from '@src/types/onyx/PriorityMode';

type ConfigArgs = Parameters<typeof sidebarOrderedReportsConfig.compute>[0];
type DerivedContext = DerivedValueContext<typeof sidebarOrderedReportsConfig.key, typeof sidebarOrderedReportsConfig.dependencies>;

const EMPTY_CONTEXT: DerivedContext = {currentValue: undefined, sourceValues: undefined};

function makeReport(id: string, millisAgo: number, overrides: Partial<Report> = {}): Report {
    const ts = new Date(Date.now() - millisAgo).toISOString().replace('T', ' ').slice(0, -1);
    return {
        reportID: id,
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.GROUP,
        reportName: `Report ${id}`,
        lastVisibleActionCreated: ts,
        lastReadTime: ts,
        lastMessageText: `msg ${id}`,
        participants: Object.fromEntries([1, 2].map((accountID) => [accountID, {notificationPreference: 'always'}])),
        ...overrides,
    } as Report;
}

function buildArgs(
    reports: OnyxCollection<Report>,
    overrides: Partial<{priorityMode: PriorityMode; betas: Beta[]; network: Network; locale: string; reportAttributes: ReportAttributesDerivedValue; policies: OnyxCollection<Policy>}> = {},
): ConfigArgs {
    const priorityMode: OnyxEntry<PriorityMode> = overrides.priorityMode ?? (CONST.PRIORITY_MODE.DEFAULT as PriorityMode);
    const betas: OnyxEntry<Beta[]> = overrides.betas ?? [];
    const network: OnyxEntry<Network> = overrides.network ?? {};
    const locale = overrides.locale ?? 'en';
    return [reports, undefined, undefined, undefined, undefined, overrides.policies, priorityMode, betas, network, locale, overrides.reportAttributes] as unknown as ConfigArgs;
}

function makeAttributes(entries: Array<[reportID: string, requiresAttention: boolean]>): ReportAttributesDerivedValue {
    const reports: ReportAttributesDerivedValue['reports'] = {};
    for (const [reportID, requiresAttention] of entries) {
        reports[reportID] = {reportName: `Report ${reportID}`, isEmpty: false, brickRoadStatus: undefined, requiresAttention, reportErrors: {}};
    }
    return {reports, locale: 'en'};
}

describe('SidebarOrderedReports Derived Value', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns empty value when reports collection is empty', () => {
        const result = sidebarOrderedReportsConfig.compute(buildArgs({}), EMPTY_CONTEXT);
        expect(result.orderedReportIDs).toEqual([]);
        expect(result.reportsToDisplay).toEqual({});
    });

    it('returns empty value when reports is undefined', () => {
        const result = sidebarOrderedReportsConfig.compute(buildArgs(undefined), EMPTY_CONTEXT);
        expect(result.orderedReportIDs).toEqual([]);
        expect(result.reportsToDisplay).toEqual({});
    });

    it('takes the full-compute path when no currentValue exists', () => {
        const reports: Record<string, Report> = {[`${ONYXKEYS.COLLECTION.REPORT}1`]: makeReport('1', 1_000)};
        const getSpy = jest.spyOn(SidebarUtils, 'getReportsToDisplayInLHN');
        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');

        sidebarOrderedReportsConfig.compute(buildArgs(reports), EMPTY_CONTEXT);

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('takes the incremental path when a collection sourceValue is present and the cache is populated', () => {
        const reports: Record<string, Report> = {[`${ONYXKEYS.COLLECTION.REPORT}1`]: makeReport('1', 1_000)};
        const seededCurrent = {
            reportsToDisplay: {[`${ONYXKEYS.COLLECTION.REPORT}1`]: reports[`${ONYXKEYS.COLLECTION.REPORT}1`]},
            orderedReportIDs: ['1'],
        };

        const getSpy = jest.spyOn(SidebarUtils, 'getReportsToDisplayInLHN');
        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');

        sidebarOrderedReportsConfig.compute(buildArgs(reports), {
            currentValue: seededCurrent,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: {[`${ONYXKEYS.COLLECTION.REPORT}1`]: reports[`${ONYXKEYS.COLLECTION.REPORT}1`]}},
        });

        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(getSpy).not.toHaveBeenCalled();
    });

    it('falls back to the full path when sourceValues is undefined even if currentValue exists', () => {
        const reports: Record<string, Report> = {[`${ONYXKEYS.COLLECTION.REPORT}1`]: makeReport('1', 1_000)};
        const seededCurrent = {
            reportsToDisplay: {[`${ONYXKEYS.COLLECTION.REPORT}1`]: reports[`${ONYXKEYS.COLLECTION.REPORT}1`]},
            orderedReportIDs: ['1'],
        };
        const getSpy = jest.spyOn(SidebarUtils, 'getReportsToDisplayInLHN');
        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');

        sidebarOrderedReportsConfig.compute(buildArgs(reports), {currentValue: seededCurrent, sourceValues: undefined});

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('translates REPORT_NAME_VALUE_PAIRS source keys to REPORT keys in the incremental path', () => {
        const reports: Record<string, Report> = {[`${ONYXKEYS.COLLECTION.REPORT}99`]: makeReport('99', 1_000)};
        const seededCurrent = {
            reportsToDisplay: {[`${ONYXKEYS.COLLECTION.REPORT}99`]: reports[`${ONYXKEYS.COLLECTION.REPORT}99`]},
            orderedReportIDs: ['99'],
        };
        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');

        sidebarOrderedReportsConfig.compute(buildArgs(reports), {
            currentValue: seededCurrent,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]: {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}99`]: {}}},
        });

        expect(updateSpy).toHaveBeenCalledTimes(1);
        const callArgs = updateSpy.mock.calls.at(0)?.at(0);
        expect(callArgs?.updatedReportsKeys).toEqual([`${ONYXKEYS.COLLECTION.REPORT}99`]);
    });

    it('translates REPORT_DRAFT_COMMENT source keys to REPORT keys in the incremental path', () => {
        const reports: Record<string, Report> = {[`${ONYXKEYS.COLLECTION.REPORT}42`]: makeReport('42', 1_000)};
        const seededCurrent = {
            reportsToDisplay: {[`${ONYXKEYS.COLLECTION.REPORT}42`]: reports[`${ONYXKEYS.COLLECTION.REPORT}42`]},
            orderedReportIDs: ['42'],
        };
        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');

        sidebarOrderedReportsConfig.compute(buildArgs(reports), {
            currentValue: seededCurrent,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT]: {[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}42`]: 'draft'}},
        });

        const callArgs = updateSpy.mock.calls.at(0)?.at(0);
        expect(callArgs?.updatedReportsKeys).toEqual([`${ONYXKEYS.COLLECTION.REPORT}42`]);
    });

    it('cascades a relevant POLICY field change to every report under that policy', () => {
        const policyID = 'POL1';
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
        const reports: Record<string, Report> = {
            [`${ONYXKEYS.COLLECTION.REPORT}a`]: makeReport('a', 1_000, {policyID}),
            [`${ONYXKEYS.COLLECTION.REPORT}b`]: makeReport('b', 2_000, {policyID}),
            [`${ONYXKEYS.COLLECTION.REPORT}c`]: makeReport('c', 3_000, {policyID: 'OTHER'}),
        };
        const seededCurrent = {
            reportsToDisplay: {
                [`${ONYXKEYS.COLLECTION.REPORT}a`]: reports[`${ONYXKEYS.COLLECTION.REPORT}a`],
                [`${ONYXKEYS.COLLECTION.REPORT}b`]: reports[`${ONYXKEYS.COLLECTION.REPORT}b`],
                [`${ONYXKEYS.COLLECTION.REPORT}c`]: reports[`${ONYXKEYS.COLLECTION.REPORT}c`],
            },
            orderedReportIDs: ['a', 'b', 'c'],
        };

        // Seed the module-level policy snapshot so the next compute can diff the renamed policy against it.
        const basePolicies: OnyxCollection<Policy> = {[policyKey]: {name: 'Workspace'} as Policy};
        sidebarOrderedReportsConfig.compute(buildArgs(reports, {policies: basePolicies}), EMPTY_CONTEXT);

        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');
        const renamedPolicies: OnyxCollection<Policy> = {[policyKey]: {name: 'Renamed Workspace'} as Policy};

        sidebarOrderedReportsConfig.compute(buildArgs(reports, {policies: renamedPolicies}), {
            currentValue: seededCurrent,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[policyKey]: renamedPolicies[policyKey]}} as never,
        });

        const callArgs = updateSpy.mock.calls.at(0)?.at(0);
        const keys = (callArgs?.updatedReportsKeys ?? []).slice().sort();
        expect(keys).toEqual([`${ONYXKEYS.COLLECTION.REPORT}a`, `${ONYXKEYS.COLLECTION.REPORT}b`]);
    });

    it('does not cascade a POLICY update when no LHN-relevant field changed', () => {
        const policyID = 'POL1';
        const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
        const reports: Record<string, Report> = {
            [`${ONYXKEYS.COLLECTION.REPORT}a`]: makeReport('a', 1_000, {policyID}),
            [`${ONYXKEYS.COLLECTION.REPORT}b`]: makeReport('b', 2_000, {policyID}),
        };
        const seededCurrent = {
            reportsToDisplay: {
                [`${ONYXKEYS.COLLECTION.REPORT}a`]: reports[`${ONYXKEYS.COLLECTION.REPORT}a`],
                [`${ONYXKEYS.COLLECTION.REPORT}b`]: reports[`${ONYXKEYS.COLLECTION.REPORT}b`],
            },
            orderedReportIDs: ['a', 'b'],
        };

        // The LHN only depends on a policy's type/name/avatar/member list. A new object with identical tracked
        // fields (e.g. an unrelated field churned) must not re-evaluate every report under the policy.
        const basePolicies: OnyxCollection<Policy> = {[policyKey]: {name: 'Workspace'} as Policy};
        sidebarOrderedReportsConfig.compute(buildArgs(reports, {policies: basePolicies}), EMPTY_CONTEXT);

        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');
        const unchangedPolicies: OnyxCollection<Policy> = {[policyKey]: {name: 'Workspace'} as Policy};

        sidebarOrderedReportsConfig.compute(buildArgs(reports, {policies: unchangedPolicies}), {
            currentValue: seededCurrent,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[policyKey]: unchangedPolicies[policyKey]}} as never,
        });

        const callArgs = updateSpy.mock.calls.at(0)?.at(0);
        expect(callArgs?.updatedReportsKeys ?? []).toEqual([]);
    });

    it('takes the incremental path on a REPORT_ATTRIBUTES change, re-evaluating only the reports whose attributes changed', () => {
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}1`;
        const otherKey = `${ONYXKEYS.COLLECTION.REPORT}2`;
        const reports: Record<string, Report> = {[reportKey]: makeReport('1', 1_000), [otherKey]: makeReport('2', 2_000)};
        // Both reports require attention so they qualify for the LHN and the seeded cache is non-empty.
        const seededAttributes = makeAttributes([
            ['1', true],
            ['2', true],
        ]);

        // The seeding compute populates the module-level attributes snapshot that the next compute diffs against.
        const seeded = sidebarOrderedReportsConfig.compute(buildArgs(reports, {reportAttributes: seededAttributes}), EMPTY_CONTEXT);

        // Only report 1's attributes entry gets a new reference; report 2 keeps its reference from the snapshot.
        const updatedReports: ReportAttributesDerivedValue['reports'] = {...seededAttributes.reports};
        updatedReports['1'] = {...seededAttributes.reports['1']};
        const updatedAttributes: ReportAttributesDerivedValue = {reports: updatedReports, locale: 'en'};
        const getSpy = jest.spyOn(SidebarUtils, 'getReportsToDisplayInLHN');
        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');

        sidebarOrderedReportsConfig.compute(buildArgs(reports, {reportAttributes: updatedAttributes}), {
            currentValue: seeded,
            sourceValues: {[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: updatedAttributes} as never,
        });

        expect(getSpy).not.toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy.mock.calls.at(0)?.at(0)?.updatedReportsKeys).toEqual([reportKey]);
    });

    it('adds a currently-hidden report to the displayed set when its attributes flip to requiresAttention', () => {
        // Focus mode hides read reports without attention, so report 7 only surfaces once it requires attention.
        // Report 1 always requires attention, so the cached displayed set is non-empty and the incremental path runs.
        const hiddenKey = `${ONYXKEYS.COLLECTION.REPORT}7`;
        const shownKey = `${ONYXKEYS.COLLECTION.REPORT}1`;
        const reports: Record<string, Report> = {[hiddenKey]: makeReport('7', 1_000), [shownKey]: makeReport('1', 2_000)};
        const focusMode = {priorityMode: CONST.PRIORITY_MODE.GSD as PriorityMode};

        const seeded = sidebarOrderedReportsConfig.compute(
            buildArgs(reports, {
                ...focusMode,
                reportAttributes: makeAttributes([
                    ['1', true],
                    ['7', false],
                ]),
            }),
            EMPTY_CONTEXT,
        );
        expect(seeded.reportsToDisplay[shownKey]).toBeDefined();
        expect(seeded.reportsToDisplay[hiddenKey]).toBeUndefined();

        const updatedAttributes = makeAttributes([
            ['1', true],
            ['7', true],
        ]);
        const result = sidebarOrderedReportsConfig.compute(buildArgs(reports, {...focusMode, reportAttributes: updatedAttributes}), {
            currentValue: seeded,
            sourceValues: {[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: updatedAttributes} as never,
        });

        expect(result.reportsToDisplay[hiddenKey]).toBeDefined();
    });

    it('falls back to the full path on an attributes trigger when there is no previous snapshot', () => {
        // The empty-reports path resets the module-level attributes snapshot to undefined.
        sidebarOrderedReportsConfig.compute(buildArgs({}), EMPTY_CONTEXT);

        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}1`;
        const reports: Record<string, Report> = {[reportKey]: makeReport('1', 1_000)};
        const attributes = makeAttributes([['1', false]]);
        const seededCurrent = {reportsToDisplay: {[reportKey]: reports[reportKey]}, orderedReportIDs: ['1']};

        const getSpy = jest.spyOn(SidebarUtils, 'getReportsToDisplayInLHN');
        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');

        sidebarOrderedReportsConfig.compute(buildArgs(reports, {reportAttributes: attributes}), {
            currentValue: seededCurrent,
            sourceValues: {[ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: attributes} as never,
        });

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(updateSpy).not.toHaveBeenCalled();
    });
});
