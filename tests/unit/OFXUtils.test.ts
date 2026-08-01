import {buildTransactionListFromSpreadsheet} from '@libs/actions/ImportTransactions';
import {getOFXColumnRoles, parseOFXToSpreadsheetRows} from '@libs/OFXUtils';

import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';

// cspell:disable
const PERSONAL_CARD_STATEMENT = `OFXHEADER:100
DATA:OFXSGML
VERSION:102

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>USD
<BANKACCTFROM>
<BANKID>000000000
<ACCTID>XXXXXXXXXXXX0000
<ACCTTYPE>CREDITLINE
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20260724000000
<DTEND>20260729235959
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260724090000
<TRNAMT>-159.97
<FITID>20260724090001
<NAME>Bookstore 12345
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260729090000
<TRNAMT>49.00
<FITID>20260729090003
<NAME>Bookstore refund
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
// cspell:enable

describe('OFXUtils', () => {
    describe('parseOFXToSpreadsheetRows', () => {
        it('parses a bank statement into dated rows with the charge sign flipped', () => {
            expect(parseOFXToSpreadsheetRows(PERSONAL_CARD_STATEMENT)).toEqual([
                ['Date', 'Merchant', 'Amount'],
                ['2026-07-24', 'Bookstore 12345', '159.97'],
                ['2026-07-29', 'Bookstore refund', '-49'],
            ]);
        });

        it('falls back to MEMO for the merchant and skips transactions missing a date or amount', () => {
            const statement = `<OFX><BANKTRANLIST>
<STMTTRN><DTPOSTED>20260101<TRNAMT>-10.00<MEMO>CORNER STORE</STMTTRN>
<STMTTRN><TRNAMT>-10.00<NAME>NO DATE</STMTTRN>
<STMTTRN><DTPOSTED>20260102<NAME>NO AMOUNT</STMTTRN>
</BANKTRANLIST></OFX>`;

            expect(parseOFXToSpreadsheetRows(statement)).toEqual([
                ['Date', 'Merchant', 'Amount'],
                ['2026-01-01', 'CORNER STORE', '10'],
            ]);
        });

        it('returns null when the file holds no transaction', () => {
            expect(parseOFXToSpreadsheetRows('Date,Merchant,Amount\n2026-01-01,Store,10.00')).toBeNull();
        });
    });

    describe('import pipeline', () => {
        it('turns the parsed rows into transactions without any manual column mapping', () => {
            const rows = parseOFXToSpreadsheetRows(PERSONAL_CARD_STATEMENT) ?? [];
            const spreadsheet: ImportedSpreadsheet = {
                data: rows.at(0)?.map((column, columnIndex) => rows.map((row) => row.at(columnIndex) ?? '')) ?? [],
                columns: getOFXColumnRoles(),
                containsHeader: true,
                isImportingMultiLevelTags: false,
                isImportingIndependentMultiLevelTags: false,
                isGLAdjacent: false,
            };

            const transactions = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(transactions).toHaveLength(2);
            expect(transactions.at(0)).toEqual(expect.objectContaining({created: '2026-07-24', merchant: 'Bookstore 12345', amount: 15997}));
            expect(transactions.at(1)).toEqual(expect.objectContaining({created: '2026-07-29', merchant: 'Bookstore refund', amount: -4900}));
        });
    });
});
