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
<DTSTART>20260301000000
<DTEND>20260305235959
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260302103000
<TRNAMT>-24.99
<FITID>1000000001
<NAME>Bookstore 12345
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260304090000
<TRNAMT>10.00
<FITID>1000000002
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
                ['2026-03-02', 'Bookstore 12345', '24.99'],
                ['2026-03-04', 'Bookstore refund', '-10'],
            ]);
        });

        it('parses an OFX 2.x credit card statement, including a time zone suffix, an escaped merchant and a PAYEE merchant', () => {
            // cspell:disable
            const statement = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<?OFX OFXHEADER="200" VERSION="211" SECURITY="NONE"?>
<OFX>
  <CREDITCARDMSGSRSV1><CCSTMTTRNRS><CCSTMTRS>
    <CURDEF>USD</CURDEF>
    <BANKTRANLIST>
      <STMTTRN>
        <DTPOSTED>20260715120000.000[-5:EST]</DTPOSTED>
        <TRNAMT>-42.50</TRNAMT>
        <NAME>AT&amp;T WIRELESS</NAME>
      </STMTTRN>
      <STMTTRN>
        <DTPOSTED>20260716</DTPOSTED>
        <TRNAMT>-7.25</TRNAMT>
        <PAYEE><NAME>BAKERY</NAME><CITY>Denver</CITY></PAYEE>
      </STMTTRN>
    </BANKTRANLIST>
  </CCSTMTRS></CCSTMTTRNRS></CREDITCARDMSGSRSV1>
</OFX>`;
            // cspell:enable

            expect(parseOFXToSpreadsheetRows(statement)).toEqual([
                ['Date', 'Merchant', 'Amount'],
                ['2026-07-15', 'AT&T WIRELESS', '42.5'],
                ['2026-07-16', 'BAKERY', '7.25'],
            ]);
        });

        it('falls back to MEMO for the merchant and skips transactions missing a date or amount', () => {
            // cspell:disable
            const statement = `<OFX><BANKTRANLIST>
<STMTTRN><DTPOSTED>20260101<TRNAMT>-10.00<MEMO>CORNER STORE</STMTTRN>
<STMTTRN><TRNAMT>-10.00<NAME>NO DATE</STMTTRN>
<STMTTRN><DTPOSTED>20260102<NAME>NO AMOUNT</STMTTRN>
</BANKTRANLIST></OFX>`;
            // cspell:enable

            expect(parseOFXToSpreadsheetRows(statement)).toEqual([
                ['Date', 'Merchant', 'Amount'],
                ['2026-01-01', 'CORNER STORE', '10'],
            ]);
        });

        it('reads comma decimal separators and thousands grouping', () => {
            // cspell:disable
            const statement = `<OFX><BANKTRANLIST>
<STMTTRN><DTPOSTED>20260101<TRNAMT>-24,99<NAME>COMMA DECIMAL</STMTTRN>
<STMTTRN><DTPOSTED>20260102<TRNAMT>-1.234,56<NAME>EURO GROUPING</STMTTRN>
<STMTTRN><DTPOSTED>20260103<TRNAMT>-1,234.56<NAME>US GROUPING</STMTTRN>
<STMTTRN><DTPOSTED>20260104<TRNAMT>-1,234<NAME>NO DECIMALS</STMTTRN>
<STMTTRN><DTPOSTED>20260105<TRNAMT>-24.9900<NAME>FIXED PRECISION</STMTTRN>
</BANKTRANLIST></OFX>`;
            // cspell:enable

            expect(parseOFXToSpreadsheetRows(statement)).toEqual([
                ['Date', 'Merchant', 'Amount'],
                ['2026-01-01', 'COMMA DECIMAL', '24.99'],
                ['2026-01-02', 'EURO GROUPING', '1234.56'],
                ['2026-01-03', 'US GROUPING', '1234.56'],
                ['2026-01-04', 'NO DECIMALS', '1234'],
                ['2026-01-05', 'FIXED PRECISION', '24.99'],
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
            expect(transactions.at(0)).toEqual(expect.objectContaining({created: '2026-03-02', merchant: 'Bookstore 12345', amount: 2499}));
            expect(transactions.at(1)).toEqual(expect.objectContaining({created: '2026-03-04', merchant: 'Bookstore refund', amount: -1000}));
        });
    });
});
