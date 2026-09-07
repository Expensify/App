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
            currency: 'USD',
        };
        return acc;
    }, {});
}

describe('deriveSelectedReports', () => {
    it('includes a report whose every transaction is selected', () => {
        const data = [buildReportGroup('report_a', [buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1'}), buildTransaction({keyForList: 'tx_2', transactionID: 'tx_2'})])];

        const reports = deriveSelectedReports(buildSelected('tx_1', 'tx_2'), data);

        expect(reports.map(({reportID}) => reportID)).toEqual(['report_a']);
    });

    it('excludes a report when one of its selectable transactions is unselected', () => {
        const data = [buildReportGroup('report_a', [buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1'}), buildTransaction({keyForList: 'tx_2', transactionID: 'tx_2'})])];

        const reports = deriveSelectedReports(buildSelected('tx_1'), data);

        expect(reports).toEqual([]);
    });

    it('includes a report whose remaining transactions are selected while another is pending delete', () => {
        // Selecting the group never writes an entry for a row being deleted, so requiring one would drop the report.
        const data = [
            buildReportGroup('report_a', [
                buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
                buildTransaction({keyForList: 'tx_2', transactionID: 'tx_2'}),
            ]),
        ];

        const reports = deriveSelectedReports(buildSelected('tx_2'), data);

        expect(reports.map(({reportID}) => reportID)).toEqual(['report_a']);
    });

    it('excludes a report whose transactions are all pending delete', () => {
        const data = [
            buildReportGroup('report_a', [buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})], {
                keyForList: 'report_a',
            }),
        ];

        const reports = deriveSelectedReports(buildSelected('report_a', 'tx_1'), data);

        expect(reports).toEqual([]);
    });

    it('answers from the group key when the report carries no transactions', () => {
        const data = [buildReportGroup('report_a', [])];

        const reports = deriveSelectedReports(buildSelected('report_a'), data);

        expect(reports.map(({reportID}) => reportID)).toEqual(['report_a']);
    });

    it('keeps both reports selectable when one holds a pending-delete transaction, so they can be merged', () => {
        const data = [
            buildReportGroup('report_a', [
                buildTransaction({keyForList: 'tx_1', transactionID: 'tx_1', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
                buildTransaction({keyForList: 'tx_2', transactionID: 'tx_2'}),
            ]),
            buildReportGroup('report_b', [buildTransaction({keyForList: 'tx_3', transactionID: 'tx_3', reportID: 'report_b'})]),
        ];

        const reports = deriveSelectedReports(buildSelected('tx_2', 'tx_3'), data);

        expect(reports.map(({reportID}) => reportID)).toEqual(['report_a', 'report_b']);
    });
});
