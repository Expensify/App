import visibleReportActionsConfig from '@libs/actions/OnyxDerived/configs/visibleReportActions';

import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions, ReportNameValuePairs} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxCollection} from 'react-native-onyx';

describe('visibleReportActions', () => {
    describe('SESSION detected via triggeredKeys', () => {
        const reportActionsKeyA = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}A`;
        // Only report A has report actions now; report B exists only in the previous derived value (currentValue).
        const allReportActions: OnyxCollection<ReportActions> = {[reportActionsKeyA]: {}};
        const args: Parameters<typeof visibleReportActionsConfig.compute>[0] = [allReportActions, undefined, {} as OnyxCollection<Report>, {} as OnyxCollection<ReportNameValuePairs>];
        const currentValue: VisibleReportActionsDerivedValue = {A: {}, B: {}};
        const sourceValues: Parameters<typeof visibleReportActionsConfig.compute>[1]['sourceValues'] = {[ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {[reportActionsKeyA]: {}}};

        it('recomputes incrementally (keeps a stale report) when only report actions triggered', () => {
            const result = visibleReportActionsConfig.compute(args, {currentValue, sourceValues, triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT_ACTIONS])});

            // Incremental: report B (absent from allReportActions) is retained from the previous value.
            expect(result.B).toBeDefined();
        });

        it('does a full recompute (drops the stale report) when SESSION also triggered, even with no SESSION delta', () => {
            const result = visibleReportActionsConfig.compute(args, {currentValue, sourceValues, triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.SESSION])});

            // Full recompute: report B is not in allReportActions, so it is dropped.
            expect(result.B).toBeUndefined();
            expect(result.A).toBeDefined();
        });
    });

    it('hides a support survey when the ticket has been replaced', () => {
        // Given a support survey that was visible before the replacement ticket arrived
        const reportID = 'supportTicketReportID';
        const surveyActionID = 'surveyActionID';
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const reportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`;
        const unrelatedReportID = 'unrelatedReportID';
        const unrelatedActionID = 'unrelatedActionID';
        const unrelatedReportKey = `${ONYXKEYS.COLLECTION.REPORT}${unrelatedReportID}`;
        const unrelatedReportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${unrelatedReportID}`;
        const allReportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey]: {
                [surveyActionID]: {
                    reportActionID: surveyActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY,
                    created: '2026-10-13 12:00:00.000',
                },
            },
        };
        const args: Parameters<typeof visibleReportActionsConfig.compute>[0] = [
            allReportActions,
            undefined,
            {[reportKey]: {reportID, type: CONST.REPORT.TYPE.SUPPORT_TICKET}, [unrelatedReportKey]: {reportID: unrelatedReportID, type: CONST.REPORT.TYPE.CHAT}},
            {[reportNameValuePairsKey]: {reopenedAsReportID: 'replacementReportID'}},
        ];
        const currentValue: VisibleReportActionsDerivedValue = {
            [reportID]: {[surveyActionID]: true},
            [unrelatedReportID]: {[unrelatedActionID]: true},
        };

        // When the replacement and an unrelated report NVP trigger a recompute
        const result = visibleReportActionsConfig.compute(args, {
            currentValue,
            sourceValues: {
                [ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]: {
                    [reportNameValuePairsKey]: {reopenedAsReportID: 'replacementReportID'},
                    [unrelatedReportNameValuePairsKey]: {agentZeroProcessingRequestIndicator: 'processing'},
                },
            },
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]),
        });

        // Then the shared visibility state hides the stale survey without recomputing unrelated reports
        expect(result[reportID]?.[surveyActionID]).toBe(false);
        expect(result[unrelatedReportID]).toBe(currentValue[unrelatedReportID]);
    });

    it('recomputes only the changed report when a report changes', () => {
        // Given a closed report that turned into a support ticket, where the closed action shows only for support tickets
        const reportID = 'ticketReportID';
        const closedActionID = 'closedActionID';
        const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
        const unrelatedReportID = 'unrelatedReportID';
        const ticketReport = {reportID, type: CONST.REPORT.TYPE.SUPPORT_TICKET};
        const allReportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey]: {
                [closedActionID]: {
                    reportActionID: closedActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    created: '2026-11-11 12:00:00.000',
                },
            },
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${unrelatedReportID}`]: {},
        };
        const args: Parameters<typeof visibleReportActionsConfig.compute>[0] = [allReportActions, undefined, {[reportKey]: ticketReport}, {}];
        const currentValue: VisibleReportActionsDerivedValue = {
            [reportID]: {[closedActionID]: false},
            [unrelatedReportID]: {},
        };

        // When only the report triggers a recompute
        const result = visibleReportActionsConfig.compute(args, {
            currentValue,
            sourceValues: {[ONYXKEYS.COLLECTION.REPORT]: {[reportKey]: ticketReport}},
            triggeredKeys: new Set<OnyxKey>([ONYXKEYS.COLLECTION.REPORT]),
        });

        // Then the closed action shows, and the unrelated report keeps its previous value because it was not recomputed
        expect(result[reportID]?.[closedActionID]).toBe(true);
        expect(result[unrelatedReportID]).toBe(currentValue[unrelatedReportID]);
    });
});
