import type {TransactionGroupListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import {mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';

import CONST from '@src/CONST';

import createMock from '../../utils/createMock';

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
});
