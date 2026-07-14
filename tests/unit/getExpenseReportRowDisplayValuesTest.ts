import getExpenseReportRowDisplayValues from '@components/Search/SearchList/ListItem/getExpenseReportRowDisplayValues';

import {convertToDisplayString} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import {translateLocal} from '../utils/TestHelper';

const deps = {translate: translateLocal, convertToDisplayString};
const DELETE = CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

describe('getExpenseReportRowDisplayValues', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
    });

    it('should format the total as the amount', () => {
        const {amount} = getExpenseReportRowDisplayValues({totalDisplaySpend: 12345, currency: 'USD'}, deps);
        expect(amount).toContain('123.45');
    });

    it('should announce the scanning text instead of an amount while scanning', () => {
        const {amount} = getExpenseReportRowDisplayValues({totalDisplaySpend: 0, currency: 'USD', isAllScanning: true}, deps);
        expect(amount).toContain('Scanning');
        expect(amount).not.toContain('0.00');
    });

    it('should count only non-deleted transactions, ignoring transactionCount', () => {
        const {expenseCountText} = getExpenseReportRowDisplayValues(
            {transactions: [{pendingAction: undefined}, {pendingAction: undefined}, {pendingAction: DELETE}], transactionCount: 99},
            deps,
        );
        expect(expenseCountText).toBe('2 expenses');
    });

    it('should fall back to transactionCount when every transaction is pending delete', () => {
        const {expenseCountText} = getExpenseReportRowDisplayValues({transactions: [{pendingAction: DELETE}], transactionCount: 7}, deps);
        expect(expenseCountText).toBe('7 expenses');
    });

    it('should use the singular expense-count text for a single transaction', () => {
        const {expenseCountText} = getExpenseReportRowDisplayValues({transactions: [{pendingAction: undefined}], transactionCount: 0}, deps);
        expect(expenseCountText).toBe('1 expense');
    });

    it('should return an empty date when the report has no created timestamp', () => {
        const {date} = getExpenseReportRowDisplayValues({created: ''}, deps);
        expect(date).toBe('');
    });

    it('should include the year in the date for a past-year report', () => {
        const {date} = getExpenseReportRowDisplayValues({created: '2020-01-15 10:00:00'}, deps);
        expect(date).toContain('2020');
    });
});
