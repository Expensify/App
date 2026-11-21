import {getApproverColumnRole, getImportedApprovers} from '@libs/importSpreadsheetUtils';

import CONST from '@src/CONST';

const APPROVER_POSITIONS = [1, 2, 3];
const HEADER = ['Email', ...APPROVER_POSITIONS.flatMap((position) => [`Approver ${position}`, `Approver ${position} approval type`, `Approver ${position} limit`])];
const MAPPED_COLUMNS = [
    CONST.CSV_IMPORT_COLUMNS.EMAIL,
    ...APPROVER_POSITIONS.flatMap((position) => [getApproverColumnRole(position, 'approver'), getApproverColumnRole(position, 'approvalType'), getApproverColumnRole(position, 'limit')]),
];

/** The importer stores spreadsheets column by column, so this turns rows into that shape */
function toColumns(rows: string[][]): string[][] {
    return (rows.at(0) ?? []).map((_, columnIndex) => rows.map((row) => row.at(columnIndex) ?? ''));
}

describe('getImportedApprovers', () => {
    it("reads each row's approvers in order, with the limits of over limit approvers in cents", () => {
        // Given rows listing an approver followed by two over limit approvers, two approvers who get every report, and none
        const spreadsheetData = toColumns([
            HEADER,
            ['submitter@example.com', ' Manager@Example.com ', '', '', 'director@example.com', 'over-limit', '$1,250.50', 'cfo@example.com', 'OVER LIMIT', '$2,000'],
            ['other@example.com', 'manager@example.com', 'Always', '', 'cfo@example.com', '', '', '', '', ''],
            ['nobody@example.com', '', '', '', '', '', '', '', '', ''],
        ]);

        // When the approvers are read
        const {approversByRow, error, limitMismatchApproverEmails} = getImportedApprovers({
            spreadsheetData,
            mappedColumns: MAPPED_COLUMNS,
            containsHeader: true,
            currencySymbol: '$',
            currency: 'USD',
        });

        // Then every row gets its approvers in order, with emails read the way logins are stored, approval types read whatever
        // their casing and separators, and an empty approval type read as Always
        expect(error).toBeUndefined();
        expect(limitMismatchApproverEmails).toEqual([]);
        expect(approversByRow).toEqual([
            [{email: 'manager@example.com'}, {email: 'director@example.com', overLimitAmount: 125050}, {email: 'cfo@example.com', overLimitAmount: 200000}],
            [{email: 'manager@example.com'}, {email: 'cfo@example.com'}],
            [],
        ]);
    });

    it.each([
        ['a later approver without an earlier one', ['submitter@example.com', '', '', '', 'cfo@example.com', '', '', '', '', ''], 'spreadsheet.approversOutOfOrder'],
        [
            'an approval type and limit without their approver',
            ['submitter@example.com', 'manager@example.com', '', '', '', 'Over limit', '100', '', '', ''],
            'spreadsheet.approversOutOfOrder',
        ],
        ['the same approver twice', ['submitter@example.com', 'manager@example.com', '', '', 'Manager@example.com', '', '', '', '', ''], 'spreadsheet.approverRepeated'],
        [
            'an approval type other than Always or Over limit',
            ['submitter@example.com', 'manager@example.com', '', '', 'director@example.com', 'Sometimes', '', '', '', ''],
            'spreadsheet.invalidApprovalType',
        ],
        [
            'a first approver who is an over limit approver',
            ['submitter@example.com', 'manager@example.com', 'Over limit', '100', '', '', '', '', '', ''],
            'spreadsheet.firstApproverOverLimit',
        ],
        [
            'an over limit approver with a lower limit than the one right before them',
            ['submitter@example.com', 'manager@example.com', '', '', 'director@example.com', 'Over limit', '200', 'cfo@example.com', 'Over limit', '100'],
            'spreadsheet.decreasingApprovalLimits',
        ],
    ])('flags the row number of a row with %s', (_, invalidRow, translationKey) => {
        // Given a valid row followed by one whose approvers a workflow can't hold
        const spreadsheetData = toColumns([HEADER, ['first@example.com', 'manager@example.com', '', '', '', '', '', '', '', ''], invalidRow]);

        // When the approvers are read
        const {error} = getImportedApprovers({spreadsheetData, mappedColumns: MAPPED_COLUMNS, containsHeader: true});

        // Then the error explains the problem and names the row the way the spreadsheet numbers it, header included
        expect(error).toEqual({translationKey, rowNumber: 3});
    });

    it('lists every approver whose approval type and limit do not match, once each, instead of flagging a row', () => {
        // Given an over limit approver without a limit, and approvers with a limit who get every report, with or without an
        // approval type, one of them on two rows
        const spreadsheetData = toColumns([
            HEADER,
            ['first@example.com', 'manager@example.com', '', '', 'director@example.com', 'Over limit', '0', '', '', ''],
            ['second@example.com', 'manager@example.com', '', '', 'cfo@example.com', 'Always', '100', '', '', ''],
            ['third@example.com', 'manager@example.com', '', '', 'cfo@example.com', '', '100', 'ceo@example.com', 'Over limit', '200'],
        ]);

        // When the approvers are read
        const {error, limitMismatchApproverEmails} = getImportedApprovers({spreadsheetData, mappedColumns: MAPPED_COLUMNS, containsHeader: true});

        // Then every approver to fix is listed once, in the order the spreadsheet first lists them, without an error for a row, since
        // the admin fixes these approver by approver
        expect(limitMismatchApproverEmails).toEqual(['director@example.com', 'cfo@example.com']);
        expect(error).toBeUndefined();
    });
});
