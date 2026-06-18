import getExpenseReportRowAccessibilityLabel from '@components/Search/SearchList/ListItem/getExpenseReportRowAccessibilityLabel';

describe('getExpenseReportRowAccessibilityLabel', () => {
    it('should combine report name, status, and amount', () => {
        const label = getExpenseReportRowAccessibilityLabel({
            reportName: "Aki's expenses",
            formattedStatus: 'Approved',
            totalDisplaySpend: 12345,
            currency: 'USD',
        });

        expect(label).toContain("Aki's expenses");
        expect(label).toContain('Approved');
        expect(label).toContain('123.45');
    });

    it('should omit empty segments such as a missing status', () => {
        const label = getExpenseReportRowAccessibilityLabel({
            reportName: "Aki's expenses",
            totalDisplaySpend: 0,
            currency: 'USD',
        });

        expect(label).toContain("Aki's expenses");
        expect(label).not.toContain('Approved');
    });
});
