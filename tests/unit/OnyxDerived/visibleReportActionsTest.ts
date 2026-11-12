import visibleReportActionsConfig from '@libs/actions/OnyxDerived/configs/visibleReportActions';

import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions, ReportNameValuePairs} from '@src/types/onyx';
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

    it('does not cache the visibility of a REIMBURSED action that is hidden outside invoices', () => {
        // Given a NewDot REIMBURSED action and one that Auth marked with shouldShow false. Both are hidden on expense reports and shown on invoices.
        const reportID = 'reportWithNewDotPayment';
        const reimbursedActionID = 'reimbursedActionID';
        const hiddenReimbursedActionID = 'hiddenReimbursedActionID';
        const commentActionID = 'commentActionID';
        const reimbursedAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSED> = {
            reportActionID: reimbursedActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSED,
            created: '2026-10-13 12:00:00.000',
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- Auth sends isNewDot on originalMessage, which getOriginalMessage reads.
            originalMessage: {isNewDot: true},
        };
        const hiddenReimbursedAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSED> = {
            reportActionID: hiddenReimbursedActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSED,
            created: '2026-10-13 12:00:00.500',
            shouldShow: false,
        };
        const allReportActions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: {
                [reimbursedActionID]: reimbursedAction,
                [hiddenReimbursedActionID]: hiddenReimbursedAction,
                [commentActionID]: {
                    reportActionID: commentActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: '2026-10-13 12:00:01.000',
                    message: [{type: 'COMMENT', html: 'Hello', text: 'Hello'}],
                },
            },
        };
        const args: Parameters<typeof visibleReportActionsConfig.compute>[0] = [
            allReportActions,
            undefined,
            {
                [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: {
                    reportID,
                    type: CONST.REPORT.TYPE.INVOICE,
                },
            },
            {},
        ];

        // When the derived value computes the report's visibility
        const result = visibleReportActionsConfig.compute(args, {
            currentValue: undefined,
            sourceValues: undefined,
            triggeredKeys: new Set<OnyxKey>(),
        });

        // Then it leaves both payment actions out, because their visibility depends on the report type, which the cache doesn't track
        expect(result[reportID]?.[reimbursedActionID]).toBeUndefined();
        expect(result[reportID]?.[hiddenReimbursedActionID]).toBeUndefined();
        expect(result[reportID]?.[commentActionID]).toBe(true);
    });
});
