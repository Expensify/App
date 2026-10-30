import getReportAttributesUpdates from '@libs/getReportAttributesUpdates';

import type {ReportAttributesDerivedValue} from '@src/types/onyx';

type ReportAttributes = ReportAttributesDerivedValue['reports'][string];

const FIRST_REPORT_ID = '1';
const SECOND_REPORT_ID = '2';

const createAttributes = (overrides: Partial<ReportAttributes> = {}): ReportAttributes => ({
    reportName: 'Chat',
    isEmpty: false,
    brickRoadStatus: undefined,
    requiresAttention: false,
    reportErrors: {},
    ...overrides,
});

describe('getReportAttributesUpdates', () => {
    it('should return undefined when both snapshots are the same reference', () => {
        // Given a derived attributes snapshot
        const reportAttributes = {[FIRST_REPORT_ID]: createAttributes()};

        // When it is compared with itself, e.g. on a re-render unrelated to the derived value
        const updates = getReportAttributesUpdates(reportAttributes, reportAttributes);

        // Then nothing is reported as changed
        expect(updates).toBeUndefined();
    });

    it('should return undefined when the current snapshot is missing', () => {
        // Given the derived value hasn't been loaded yet
        // When it is compared with a previous snapshot
        const updates = getReportAttributesUpdates(undefined, {[FIRST_REPORT_ID]: createAttributes()});

        // Then nothing is reported as changed, since there is nothing to recheck against
        expect(updates).toBeUndefined();
    });

    it('should return undefined when entries are re-created with the same values', () => {
        // Given a snapshot whose entries are new objects with identical values, as happens when Onyx.set strips undefined fields on every recompute
        const previous = {[FIRST_REPORT_ID]: createAttributes(), [SECOND_REPORT_ID]: createAttributes({reportName: 'Thread'})};
        const current = {[FIRST_REPORT_ID]: createAttributes(), [SECOND_REPORT_ID]: createAttributes({reportName: 'Thread'})};

        // When the snapshots are compared
        const updates = getReportAttributesUpdates(current, previous);

        // Then nothing is reported as changed, so the LHN doesn't recheck reports needlessly
        expect(updates).toBeUndefined();
    });

    it('should return only the reports whose attribute values changed', () => {
        // Given a thread that was empty and an unrelated report that keeps the same values in a new object
        const previous = {[FIRST_REPORT_ID]: createAttributes(), [SECOND_REPORT_ID]: createAttributes({isEmpty: true})};
        const current = {[FIRST_REPORT_ID]: createAttributes(), [SECOND_REPORT_ID]: createAttributes({isEmpty: false})};

        // When the thread's first reply makes its derived isEmpty flip to false
        const updates = getReportAttributesUpdates(current, previous);

        // Then only the thread is reported, so the LHN can re-evaluate it with the fresh attributes
        expect(updates).toEqual([SECOND_REPORT_ID]);
    });

    it('should report a nested change inside an entry', () => {
        // Given a report without errors
        const previous = {[FIRST_REPORT_ID]: createAttributes()};

        // When an error is added to its derived attributes
        const current = {[FIRST_REPORT_ID]: createAttributes({reportErrors: {addWorkspaceRoom: 'error'}})};
        const updates = getReportAttributesUpdates(current, previous);

        // Then the report is reported as changed, since deep changes can affect its LHN visibility
        expect(updates).toEqual([FIRST_REPORT_ID]);
    });

    it('should report entries that are new in the current snapshot', () => {
        // Given a snapshot that doesn't contain a report yet
        const previous = {[FIRST_REPORT_ID]: createAttributes()};

        // When the derived value gains an entry for a new report
        const current = {[FIRST_REPORT_ID]: previous[FIRST_REPORT_ID], [SECOND_REPORT_ID]: createAttributes()};
        const updates = getReportAttributesUpdates(current, previous);

        // Then the new report is reported so the LHN can evaluate it
        expect(updates).toEqual([SECOND_REPORT_ID]);
    });

    it('should report every entry when there is no previous snapshot', () => {
        // Given the derived value is loaded for the first time
        const current = {[FIRST_REPORT_ID]: createAttributes(), [SECOND_REPORT_ID]: createAttributes()};

        // When it is compared with no previous snapshot
        const updates = getReportAttributesUpdates(current, undefined);

        // Then every report is reported as changed
        expect(updates).toEqual([FIRST_REPORT_ID, SECOND_REPORT_ID]);
    });
});
