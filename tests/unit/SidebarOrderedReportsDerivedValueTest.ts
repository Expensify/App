import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {DerivedValueContext} from '@libs/actions/OnyxDerived/types';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import sidebarOrderedReportsConfig from '@src/libs/actions/OnyxDerived/configs/sidebarOrderedReports';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Network, Report} from '@src/types/onyx';
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

function buildArgs(reports: OnyxCollection<Report>, overrides: Partial<{priorityMode: PriorityMode; betas: Beta[]; network: Network; locale: string}> = {}): ConfigArgs {
    const priorityMode: OnyxEntry<PriorityMode> = overrides.priorityMode ?? (CONST.PRIORITY_MODE.DEFAULT as PriorityMode);
    const betas: OnyxEntry<Beta[]> = overrides.betas ?? [];
    const network: OnyxEntry<Network> = overrides.network ?? {};
    const locale = overrides.locale ?? 'en';
    return [reports, undefined, undefined, undefined, undefined, undefined, priorityMode, betas, network, locale] as unknown as ConfigArgs;
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

    it('cascades a POLICY change to every report under that policy', () => {
        const policyID = 'POL1';
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
        const updateSpy = jest.spyOn(SidebarUtils, 'updateReportsToDisplayInLHN');

        sidebarOrderedReportsConfig.compute(buildArgs(reports), {
            currentValue: seededCurrent,
            sourceValues: {[ONYXKEYS.COLLECTION.POLICY]: {[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: {}}} as never,
        });

        const callArgs = updateSpy.mock.calls.at(0)?.at(0);
        const keys = (callArgs?.updatedReportsKeys ?? []).slice().sort();
        expect(keys).toEqual([`${ONYXKEYS.COLLECTION.REPORT}a`, `${ONYXKEYS.COLLECTION.REPORT}b`]);
    });
});
