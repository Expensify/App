import {buildTransactionListFromSpreadsheet} from '@libs/actions/ImportTransactions';
import {getOFXColumnRoles, parseOFXToSpreadsheetRows} from '@libs/OFXUtils';

import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';

const CITI_STATEMENT = `OFXHEADER:100
DATA:OFXSGML
VERSION:102

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>USD
<BANKACCTFROM>
<BANKID>073456789
<ACCTID>XXXXXXXXXXXX5580
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
<NAME>Audible*TD7RH43E3 888283505
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260729090000
<TRNAMT>49.00
<FITID>20260729090003
<NAME>WHOP*ENTREPRENEUR DINN Newa
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

describe('OFXUtils', () => {
    describe('parseOFXToSpreadsheetRows', () => {
        it('parses a bank statement into dated rows with the charge sign flipped', () => {
            expect(parseOFXToSpreadsheetRows(CITI_STATEMENT)).toEqual([
                ['Date', 'Merchant', 'Amount'],
                ['2026-07-24', 'Audible*TD7RH43E3 888283505', '159.97'],
                ['2026-07-29', 'WHOP*ENTREPRENEUR DINN Newa', '-49'],
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
            const rows = parseOFXToSpreadsheetRows(CITI_STATEMENT) ?? [];
            const spreadsheet = {
                data: rows.at(0)?.map((column, columnIndex) => rows.map((row) => row.at(columnIndex) ?? '')),
                columns: getOFXColumnRoles(),
                containsHeader: true,
            } as ImportedSpreadsheet;

            const transactions = buildTransactionListFromSpreadsheet(spreadsheet, {});

            expect(transactions).toHaveLength(2);
            expect(transactions.at(0)).toEqual(expect.objectContaining({created: '2026-07-24', merchant: 'Audible*TD7RH43E3 888283505', amount: 15997}));
            expect(transactions.at(1)).toEqual(expect.objectContaining({created: '2026-07-29', merchant: 'WHOP*ENTREPRENEUR DINN Newa', amount: -4900}));
        });
    });
});
