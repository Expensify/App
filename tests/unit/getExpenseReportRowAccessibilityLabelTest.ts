import getExpenseReportRowAccessibilityLabel from '@components/Search/SearchList/ListItem/getExpenseReportRowAccessibilityLabel';

import {convertToDisplayString} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import {translateLocal} from '../utils/TestHelper';

const deps = {translate: translateLocal, convertToDisplayString};

describe('getExpenseReportRowAccessibilityLabel', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
    });

    it('should combine sender, report name, status, amount, date, and expense count', () => {
        const label = getExpenseReportRowAccessibilityLabel(
            {
                formattedFrom: 'Alex 310',
                reportName: "Aki's expenses",
                formattedStatus: 'Approved',
                totalDisplaySpend: 12345,
                currency: 'USD',
                created: '2024-01-15 10:00:00',
                transactions: [],
                transactionCount: 5,
            },
            deps,
        );

        expect(label).toContain('Alex 310');
        expect(label).toContain("Aki's expenses");
        expect(label).toContain('Approved');
        expect(label).toContain('123.45');
        expect(label).toContain('5 expenses');
    });

    it('should announce the singular "1 expense" for a single-transaction report', () => {
        const label = getExpenseReportRowAccessibilityLabel({reportName: "Aki's expenses", totalDisplaySpend: 0, currency: 'USD', created: '', transactions: [], transactionCount: 1}, deps);

        expect(label).toContain('1 expense');
        expect(label).not.toContain('1 expenses');
    });

    it('should announce the scanning text instead of an amount while the report is scanning', () => {
        const label = getExpenseReportRowAccessibilityLabel(
            {reportName: "Aki's expenses", totalDisplaySpend: 0, currency: 'USD', isAllScanning: true, created: '', transactions: [], transactionCount: 0},
            deps,
        );

        expect(label).toContain('Scanning');
        expect(label).not.toContain('0.00');
    });

    it('should omit empty segments such as a missing sender or status', () => {
        const label = getExpenseReportRowAccessibilityLabel({reportName: "Aki's expenses", totalDisplaySpend: 0, currency: 'USD', created: '', transactions: [], transactionCount: 0}, deps);

        expect(label).toContain("Aki's expenses");
        expect(label).not.toContain('Approved');
        expect(label.startsWith(',')).toBe(false);
    });
});
