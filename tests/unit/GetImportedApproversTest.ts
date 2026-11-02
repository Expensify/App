import {getApproverColumnRole, getImportedApprovers} from '@libs/importSpreadsheetUtils';

import CONST from '@src/CONST';

const HEADER = ['Email', 'Approver 1', 'Approver 1 limit', 'Approver 1 over limit approver', 'Approver 2'];
const MAPPED_COLUMNS = [
    CONST.CSV_IMPORT_COLUMNS.EMAIL,
    getApproverColumnRole(1, 'approver'),
    getApproverColumnRole(1, 'approvalLimit'),
    getApproverColumnRole(1, 'overLimitApprover'),
    getApproverColumnRole(2, 'approver'),
];

/** The importer stores spreadsheets column by column, so this turns rows into that shape */
function toColumns(rows: string[][]): string[][] {
    return (rows.at(0) ?? []).map((_, columnIndex) => rows.map((row) => row.at(columnIndex) ?? ''));
}

describe('getImportedApprovers', () => {
    it("reads each row's approvers in order, with their limits in cents", () => {
        // Given rows listing two approvers, one approver, and none
        const spreadsheetData = toColumns([
            HEADER,
            ['submitter@example.com', ' Manager@Example.com ', '$1,250.50', 'director@example.com', 'cfo@example.com'],
            ['other@example.com', 'manager@example.com', '', '', ''],
            ['nobody@example.com', '', '', '', ''],
        ]);

        // When the approvers are read
        const {approversByRow, error} = getImportedApprovers({spreadsheetData, mappedColumns: MAPPED_COLUMNS, containsHeader: true, currencySymbol: '$', currency: 'USD'});

        // Then every row gets its approvers in order, with emails read the way logins are stored and limits in cents
        expect(error).toBeUndefined();
        expect(approversByRow).toEqual([
            [{email: 'manager@example.com', approvalLimit: 125050, overLimitForwardsTo: 'director@example.com'}, {email: 'cfo@example.com'}],
            [{email: 'manager@example.com'}],
            [],
        ]);
    });

    it.each([
        ['a later approver without an earlier one', ['submitter@example.com', '', '', '', 'cfo@example.com'], 'spreadsheet.approversOutOfOrder'],
        ['a limit without its approver', ['submitter@example.com', '', '100', 'director@example.com', ''], 'spreadsheet.approversOutOfOrder'],
        ['the same approver twice', ['submitter@example.com', 'manager@example.com', '', '', 'Manager@example.com'], 'spreadsheet.approverRepeated'],
        ['an approver as their own over limit approver', ['submitter@example.com', 'manager@example.com', '100', 'Manager@example.com', ''], 'spreadsheet.approverRepeated'],
        ['a limit without an over limit approver', ['submitter@example.com', 'manager@example.com', '100', '', ''], 'spreadsheet.approvalLimitIncomplete'],
        ['an over limit approver without a limit', ['submitter@example.com', 'manager@example.com', '0', 'director@example.com', ''], 'spreadsheet.approvalLimitIncomplete'],
    ])('flags the row number of a row with %s', (_, invalidRow, translationKey) => {
        // Given a valid row followed by one whose approvers a workflow can't hold
        const spreadsheetData = toColumns([HEADER, ['first@example.com', 'manager@example.com', '', '', ''], invalidRow]);

        // When the approvers are read
        const {error} = getImportedApprovers({spreadsheetData, mappedColumns: MAPPED_COLUMNS, containsHeader: true});

        // Then the error explains the problem and names the row the way the spreadsheet numbers it, header included
        expect(error).toEqual({translationKey, rowNumber: 3});
    });
});
