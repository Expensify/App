import type {TransactionGroupListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import {mapEmptyReportToSelectedEntry, stampGroupCoverageFlags} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';

import createMock from '../../utils/createMock';

const groupKey = `${CONST.SEARCH.GROUP_PREFIX}42`;

function buildSelection(entries: Record<string, Partial<SelectedTransactions[string]>>): SelectedTransactions {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Object.fromEntries(Object.entries(entries).map(([key, entry]) => [key, {isSelected: true, ...entry}])) as SelectedTransactions;
}

describe('selectionBuilders', () => {
    describe('mapEmptyReportToSelectedEntry', () => {
        it('takes displayAmount from the report-signed total for a report row', () => {
            // totalDisplaySpend is already negated for expense reports, so a credit report keeps its negative sign.
            const item = createMock<TransactionReportGroupListItemType>({
                keyForList: 'report1',
                reportID: 'report1',
                policyID: 'policy1',
                currency: CONST.CURRENCY.USD,
                groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                transactions: [],
                total: 10000,
                totalDisplaySpend: -10000,
            });

            const [, entry] = mapEmptyReportToSelectedEntry(item);

            expect(entry.displayAmount).toBe(-10000);
        });

        it('takes displayAmount from the group total for a group row', () => {
            const item = createMock<TransactionGroupListItemType>({
                keyForList: `${CONST.SEARCH.GROUP_PREFIX}category1`,
                reportID: undefined,
                policyID: 'policy1',
                currency: CONST.CURRENCY.USD,
                transactions: [],
                total: -4000,
            });

            const [, entry] = mapEmptyReportToSelectedEntry(item);

            expect(entry.displayAmount).toBe(-4000);
        });
    });

    describe('stampGroupCoverageFlags', () => {
        it('covers the remaining children when snapshot count still includes pending-delete rows', () => {
            const selected = stampGroupCoverageFlags({
                selectedTransactions: buildSelection({
                    txn1: {groupKey},
                    txn2: {groupKey},
                }),
                groupKey,
                groupCount: 3,
                loadedChildrenCount: 3,
                loadedSelectableCount: 2,
            });

            expect(selected.txn1.isEntireGroupSelected).toBe(true);
            expect(selected.txn2.isEntireGroupSelected).toBe(true);
        });

        it('does not cover a truncated limit selection as the whole group', () => {
            const selected = stampGroupCoverageFlags({
                selectedTransactions: buildSelection({
                    txn1: {isSelectedViaGroup: true, groupKey},
                    txn2: {isSelectedViaGroup: true, groupKey},
                }),
                groupKey,
                groupCount: 5,
                loadedChildrenCount: 2,
                loadedSelectableCount: 2,
            });

            expect(selected.txn1.isEntireGroupSelected).toBe(false);
            expect(selected.txn1.isSelectedViaGroup).toBe(true);
        });
    });
});
