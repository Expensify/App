import getExpenseReportRowAccessibilityLabel from '@components/Search/SearchList/ListItem/getExpenseReportRowAccessibilityLabel';

const SCANNING_TEXT = 'Scanning…';

describe('getExpenseReportRowAccessibilityLabel', () => {
    it('should combine report name, status, and amount', () => {
        const label = getExpenseReportRowAccessibilityLabel(
            {
                reportName: "Aki's expenses",
                formattedStatus: 'Approved',
                totalDisplaySpend: 12345,
                currency: 'USD',
            },
            SCANNING_TEXT,
        );

        expect(label).toContain("Aki's expenses");
        expect(label).toContain('Approved');
        expect(label).toContain('123.45');
    });

    it('should omit empty segments such as a missing status', () => {
        const label = getExpenseReportRowAccessibilityLabel(
            {
                reportName: "Aki's expenses",
                totalDisplaySpend: 0,
                currency: 'USD',
            },
            SCANNING_TEXT,
        );

        expect(label).toContain("Aki's expenses");
        expect(label).not.toContain('Approved');
    });

    it('should announce the scanning text instead of an amount while the report is scanning', () => {
        const label = getExpenseReportRowAccessibilityLabel(
            {
                reportName: "Aki's expenses",
                formattedStatus: 'Processing',
                totalDisplaySpend: 0,
                currency: 'USD',
                isAllScanning: true,
            },
            SCANNING_TEXT,
        );

        expect(label).toContain(SCANNING_TEXT);
        expect(label).not.toContain('0.00');
    });
});
