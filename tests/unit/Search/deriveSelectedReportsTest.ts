import type {TransactionListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import {deriveSelectedReports} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';

import createMock from '../../utils/createMock';

function buildTransaction(overrides: Partial<TransactionListItemType> & {keyForList: string; transactionID: string}) {
    return createMock<TransactionListItemType>({
        amount: 100,
        currency: 'USD',
        reportID: 'report_a',
        policyID: 'policy_1',
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        allActions: [CONST.SEARCH.ACTION_TYPES.VIEW],
        report: undefined,
        ...overrides,
    });
}

function buildReportGroup(reportID: string, transactions: TransactionListItemType[], overrides?: Partial<TransactionReportGroupListItemType>) {
    return createMock<TransactionReportGroupListItemType>({
        reportID,
        keyForList: reportID,
        groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        type: CONST.REPORT.TYPE.EXPENSE,
        transactions,
        total: 100,
        currency: 'USD',
        policyID: 'policy_1',
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        ...overrides,
    });
}

function buildSelected(...keys: string[]): SelectedTransactions {
    return keys.reduce<SelectedTransactions>((acc, key) => {
        acc[key] = {
            isSelected: true,
            canReject: true,
            canHold: true,
            canSplit: false,
            hasBeenSplit: false,
            canChangeReport: false,
            isHeld: false,
            canUnhold: true,
            isFromOneTransactionReport: false,
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            reportID: 'report_a',
            policyID: 'policy_1',
            amount: 100,
            displayAmount: 100,
            currency: 'USD',
        };
        return acc;
    }, {});
}

describe('deriveSelectedReports', () => {
    it('includes a report whose every transaction is selected', () => {
        // Given a report whose rows are all live, so each one must be selected for the whole report to count
        const data = [buildReportGroup('report_a', [buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1'}), buildTransaction({keyForList: 'tx_2', transactionID: 'tx_2'})])];

        // When the user selects every row in that report
        const reports = deriveSelectedReports(buildSelected('tx_1', 'tx_2'), data);

        // Then the report counts as selected, so report-level bulk actions can target it
        expect(reports.map(({reportID}) => reportID)).toEqual(['report_a']);
    });

    it('excludes a report when one of its selectable transactions is unselected', () => {
        // Given a report with two live rows, which guards against the pending-delete skip loosening the normal rule
        const data = [buildReportGroup('report_a', [buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1'}), buildTransaction({keyForList: 'tx_2', transactionID: 'tx_2'})])];

        // When the user selects only one of those rows
        const reports = deriveSelectedReports(buildSelected('tx_1'), data);

        // Then the report is not selected, because a partial selection must not trigger report-level actions
        expect(reports).toEqual([]);
    });

    it('includes a report whose remaining transactions are selected while another is pending delete', () => {
        // Given a report where one row was deleted offline and is still pending delete
        const data = [
            buildReportGroup('report_a', [
                buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
                buildTransaction({keyForList: 'tx_2', transactionID: 'tx_2'}),
            ]),
        ];

        // When the report is selected, which never writes a selection entry for the row being deleted
        const reports = deriveSelectedReports(buildSelected('tx_2'), data);

        // Then the report still counts as selected, because requiring an entry for the deleted row would drop it
        expect(reports.map(({reportID}) => reportID)).toEqual(['report_a']);
    });

    it('excludes a report whose transactions are all pending delete', () => {
        // Given a report whose only row is pending delete, so nothing in it is left to act on
        const data = [
            buildReportGroup('report_a', [buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})], {
                keyForList: 'report_a',
            }),
        ];

        // When stale selection entries exist for both the group and its deleted row
        const reports = deriveSelectedReports(buildSelected('report_a', 'tx_1'), data);

        // Then the report is not selected, matching the group checkbox, which treats an all-deleted group as unselected
        expect(reports).toEqual([]);
    });

    it('answers from the group key when the report carries no transactions', () => {
        // Given a report whose rows are not loaded, so there are no rows to check
        const data = [buildReportGroup('report_a', [])];

        // When only the group key is selected
        const reports = deriveSelectedReports(buildSelected('report_a'), data);

        // Then the group key decides, so reports without loaded rows stay selectable
        expect(reports.map(({reportID}) => reportID)).toEqual(['report_a']);
    });

    it('keeps both reports selectable when one holds a pending-delete transaction, so they can be merged', () => {
        // Given one report that lost an expense offline and another report that is untouched
        const data = [
            buildReportGroup('report_a', [
                buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
                buildTransaction({keyForList: 'tx_2', transactionID: 'tx_2'}),
            ]),
            buildReportGroup('report_b', [buildTransaction({keyForList: 'tx_3', transactionID: 'tx_3', reportID: 'report_b'})]),
        ];

        // When the user bulk selects both reports
        const reports = deriveSelectedReports(buildSelected('tx_2', 'tx_3'), data);

        // Then both reports count as selected, so the Merge reports option can appear
        expect(reports.map(({reportID}) => reportID)).toEqual(['report_a', 'report_b']);
    });
});
