import CONST from '@src/CONST';

/**
 * Guard tests for the single source of truth that drives the two expense column pickers.
 *
 * `CONST.SEARCH.COLUMN_AVAILABILITY` declares, per transaction-level column, whether it is available in the
 * Search picker (`search`) and/or the single-report picker (`reportView`). Both
 * `CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE` and `CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS` are derived from it.
 *
 * These tests fail if a new `TABLE_COLUMNS` value is added without a deliberate availability decision (either an
 * entry in `COLUMN_AVAILABILITY` or an explicit listing under another surface), preventing the two pickers from
 * silently drifting apart the way they did historically.
 */
describe('Column availability single source of truth', () => {
    const TABLE_COLUMNS = CONST.SEARCH.TABLE_COLUMNS;
    const allTableColumns = new Set<string>(Object.values(TABLE_COLUMNS));
    const availabilityColumns: string[] = Object.values(CONST.SEARCH.COLUMN_AVAILABILITY).map((availability) => availability.column);

    // Columns that intentionally belong to surfaces other than the two expense column pickers. Every
    // TABLE_COLUMNS value must be either classified in COLUMN_AVAILABILITY or listed here, so adding a new
    // column forces a deliberate decision instead of silently doing nothing.
    const OTHER_SURFACE_COLUMNS = new Set<string>([
        // Structural / row-chrome columns rendered implicitly, never user-toggleable.
        TABLE_COLUMNS.AVATAR,
        TABLE_COLUMNS.TYPE,
        TABLE_COLUMNS.COMMENTS,
        // Task search view.
        TABLE_COLUMNS.ASSIGNEE,
        TABLE_COLUMNS.IN,
        // Expense-report (report list) view.
        TABLE_COLUMNS.REIMBURSABLE_TOTAL,
        TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL,
        TABLE_COLUMNS.FIRST_APPROVER,
        TABLE_COLUMNS.FIRST_APPROVED,
        TABLE_COLUMNS.PAID_STATUS,
        // Grouped search views.
        TABLE_COLUMNS.EXPENSES,
        TABLE_COLUMNS.FEED,
        TABLE_COLUMNS.WITHDRAWN,
        TABLE_COLUMNS.BANK_ACCOUNT,
        TABLE_COLUMNS.GROUP_FROM,
        TABLE_COLUMNS.GROUP_EXPENSES,
        TABLE_COLUMNS.GROUP_TOTAL,
        TABLE_COLUMNS.GROUP_CARD,
        TABLE_COLUMNS.GROUP_FEED,
        TABLE_COLUMNS.GROUP_BANK_ACCOUNT,
        TABLE_COLUMNS.GROUP_WITHDRAWN,
        TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
        TABLE_COLUMNS.GROUP_CATEGORY,
        TABLE_COLUMNS.GROUP_MERCHANT,
        TABLE_COLUMNS.GROUP_TAG,
        TABLE_COLUMNS.GROUP_MONTH,
        TABLE_COLUMNS.GROUP_WEEK,
        TABLE_COLUMNS.GROUP_YEAR,
        TABLE_COLUMNS.GROUP_QUARTER,
        TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS,
    ]);

    test('every TABLE_COLUMNS value is classified in COLUMN_AVAILABILITY or owned by another surface', () => {
        const unclassified = [...allTableColumns].filter((column) => !availabilityColumns.includes(column) && !OTHER_SURFACE_COLUMNS.has(column));

        // If this fails, a new TABLE_COLUMNS value was added without deciding its picker availability.
        // Add it to CONST.SEARCH.COLUMN_AVAILABILITY (with search/reportView flags) or, if it belongs to
        // another surface (grouped/report-list/task view), to OTHER_SURFACE_COLUMNS above.
        expect(unclassified).toEqual([]);
    });

    test('COLUMN_AVAILABILITY and OTHER_SURFACE_COLUMNS are disjoint', () => {
        const overlap = availabilityColumns.filter((column) => OTHER_SURFACE_COLUMNS.has(column));
        expect(overlap).toEqual([]);
    });

    test('every value in COLUMN_AVAILABILITY is a valid TABLE_COLUMNS value', () => {
        const invalid = availabilityColumns.filter((column) => !allTableColumns.has(column));
        expect(invalid).toEqual([]);
    });

    test('TYPE_CUSTOM_COLUMNS.EXPENSE is exactly the search-enabled columns in declaration order', () => {
        const expectedSearchColumns = Object.values(CONST.SEARCH.COLUMN_AVAILABILITY)
            .filter((availability) => availability.search)
            .map((availability) => availability.column);
        expect(Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE)).toEqual(expectedSearchColumns);
    });

    test('REPORT_DETAILS_CUSTOM_COLUMNS is exactly the reportView-enabled columns in declaration order', () => {
        const expectedReportColumns = Object.values(CONST.SEARCH.COLUMN_AVAILABILITY)
            .filter((availability) => availability.reportView)
            .map((availability) => availability.column);
        expect(Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS)).toEqual(expectedReportColumns);
    });

    test('every derived picker column is a valid TABLE_COLUMNS value', () => {
        const expenseColumns = Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE);
        const reportColumns = Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS);
        expect(expenseColumns.filter((column) => !allTableColumns.has(column))).toEqual([]);
        expect(reportColumns.filter((column) => !allTableColumns.has(column))).toEqual([]);
    });

    test('the four transaction-level columns are aligned into the single-report picker', () => {
        const reportColumns = Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS);
        expect(reportColumns).toContain(TABLE_COLUMNS.POSTED);
        expect(reportColumns).toContain(TABLE_COLUMNS.ATTENDEES);
        expect(reportColumns).toContain(TABLE_COLUMNS.TOTAL_PER_ATTENDEE);
        expect(reportColumns).toContain(TABLE_COLUMNS.ORIGINAL_AMOUNT);
    });

    test('report-level columns stay out of the single-report picker', () => {
        const reportColumns = Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS);
        const reportLevelColumns = [
            TABLE_COLUMNS.STATUS,
            TABLE_COLUMNS.PAID_STATUS,
            TABLE_COLUMNS.SUBMITTED,
            TABLE_COLUMNS.APPROVED,
            TABLE_COLUMNS.EXPORTED,
            TABLE_COLUMNS.EXPORTED_TO,
            TABLE_COLUMNS.FROM,
            TABLE_COLUMNS.TO,
            TABLE_COLUMNS.POLICY_NAME,
            TABLE_COLUMNS.REPORT_ID,
            TABLE_COLUMNS.BASE_62_REPORT_ID,
            TABLE_COLUMNS.TITLE,
            TABLE_COLUMNS.ACTION,
        ];
        for (const column of reportLevelColumns) {
            expect(reportColumns).not.toContain(column);
        }
    });

    test('the derived picker lists match their snapshots', () => {
        // Snapshots make any future change to either picker list a deliberate, reviewed update.
        expect(Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS.EXPENSE)).toMatchSnapshot('TYPE_CUSTOM_COLUMNS.EXPENSE');
        expect(Object.values(CONST.SEARCH.REPORT_DETAILS_CUSTOM_COLUMNS)).toMatchSnapshot('REPORT_DETAILS_CUSTOM_COLUMNS');
    });
});
