import CONST from '@src/CONST';

import {Str} from 'expensify-common';

import {splitExtensionFromFileName} from './fileDownload/FileUtils';

// The headers stay untranslated because they are persisted in the saved column layout and matched by name on a later import.
const OFX_COLUMNS = [
    {header: 'Date', role: CONST.CSV_IMPORT_COLUMNS.DATE},
    {header: 'Merchant', role: CONST.CSV_IMPORT_COLUMNS.MERCHANT},
    {header: 'Amount', role: CONST.CSV_IMPORT_COLUMNS.AMOUNT},
];

const STATEMENT_TRANSACTION_REGEX = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;

/**
 * Reads a single OFX element. OFX 1.x is SGML and leaves leaf elements unclosed, so a value runs until the next tag.
 */
function getElementValue(statementTransaction: string, tag: string): string {
    const match = new RegExp(`<${tag}>([^<]*)`, 'i').exec(statementTransaction);
    return match?.at(1)?.trim() ?? '';
}

/**
 * Converts an OFX DTPOSTED (YYYYMMDD, optionally followed by a time and time zone) to YYYY-MM-DD.
 */
function getPostedDate(postedDateTime: string): string {
    const date = postedDateTime.slice(0, 8);
    if (!/^\d{8}$/.test(date)) {
        return '';
    }
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

/**
 * The spec wants a period, but plenty of banks ship a comma decimal separator or thousands grouping.
 * Only the right-most separator can be the decimal point, and only when one or two digits follow it.
 */
function normalizeSeparators(transactionAmount: string): string {
    const decimalIndex = Math.max(transactionAmount.lastIndexOf(','), transactionAmount.lastIndexOf('.'));
    if (decimalIndex < 0) {
        return transactionAmount;
    }

    const tail = transactionAmount.slice(decimalIndex + 1);
    const head = transactionAmount.slice(0, decimalIndex).replaceAll(/[,.]/g, '');
    return /^\d{1,2}$/.test(tail) ? `${head}.${tail}` : `${head}${tail}`;
}

/**
 * OFX signs a charge negative, while the importer treats a positive amount as a charge, so the sign is flipped here.
 */
function getAmount(transactionAmount: string): string {
    const amount = Number(normalizeSeparators(transactionAmount));
    if (!transactionAmount || !Number.isFinite(amount)) {
        return '';
    }
    return String(-amount);
}

/**
 * Parses an OFX/QFX bank statement into the row-major grid the spreadsheet import flow expects,
 * returning null when the file holds no usable transaction.
 */
function parseOFXToSpreadsheetRows(fileContent: string): string[][] | null {
    const rows: string[][] = [];

    for (const [, statementTransaction] of fileContent.matchAll(STATEMENT_TRANSACTION_REGEX)) {
        const date = getPostedDate(getElementValue(statementTransaction, 'DTPOSTED'));
        const amount = getAmount(getElementValue(statementTransaction, 'TRNAMT'));
        if (!date || !amount) {
            continue;
        }

        // Some banks leave NAME empty and put the merchant in MEMO instead.
        const merchant = getElementValue(statementTransaction, 'NAME') || getElementValue(statementTransaction, 'MEMO');

        // OFX 2.x is XML, so a merchant like AT&T arrives escaped as AT&amp;T.
        rows.push([date, Str.htmlDecode(merchant), amount]);
    }

    if (rows.length === 0) {
        return null;
    }

    return [OFX_COLUMNS.map(({header}) => header), ...rows];
}

/**
 * The OFX grid always has the same columns, so the mapping step is filled in instead of being left to the user.
 */
function getOFXColumnRoles(): Record<number, string> {
    return Object.fromEntries(OFX_COLUMNS.map(({role}, columnIndex) => [columnIndex, role]));
}

/**
 * OFX carries its own sign convention and column layout, so both the reader and the importer key off this.
 */
function isOFXStatement(fileName: string): boolean {
    const extensions: readonly string[] = CONST.OFX_STATEMENT_EXTENSIONS;
    return extensions.includes(splitExtensionFromFileName(fileName).fileExtension.toLowerCase());
}

export {parseOFXToSpreadsheetRows, getOFXColumnRoles, isOFXStatement};
