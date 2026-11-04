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

    it('leaves invoice previews out of the cache, so the invoice decides at display time whether the bill receiver sees them', () => {
        // Given an invoice room with a preview of an invoice the receiver pays through its linked bill, and a chat with an expense report preview
        const roomReportID = 'invoiceRoomReportID';
        const invoiceReportID = 'invoiceReportID';
        const chatReportID = 'chatReportID';
        const expenseReportID = 'expenseReportID';
        const makePreview = (reportActionID: string, linkedReportID: string): ReportAction => ({
            reportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            created: '2026-11-01 12:00:00.000',
            message: {linkedReportID},
        });
        const allReportActions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${roomReportID}`]: {invoicePreviewID: makePreview('invoicePreviewID', invoiceReportID)},
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`]: {expensePreviewID: makePreview('expensePreviewID', expenseReportID)},
        };
        const allReports: OnyxCollection<Report> = {
            [`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`]: {reportID: invoiceReportID, type: CONST.REPORT.TYPE.INVOICE, isHiddenForBillReceiver: true},
            [`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`]: {reportID: expenseReportID, type: CONST.REPORT.TYPE.EXPENSE},
        };

        // When the derived value computes every report's visibility
        const result = visibleReportActionsConfig.compute([allReportActions, undefined, allReports, {}], {
            currentValue: undefined,
            sourceValues: undefined,
            triggeredKeys: new Set<OnyxKey>(),
        });

        // Then the invoice preview has no cached value, because the invoice's isHiddenForBillReceiver flag can change without the preview changing
        expect(result[roomReportID]?.invoicePreviewID).toBeUndefined();
        expect(result[chatReportID]?.expensePreviewID).toBe(true);
    });
});
