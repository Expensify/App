import type {ColumnRole} from '@components/ImportColumn';

import CONST from '@src/CONST';
import type {ImportedSpreadsheetApprover} from '@src/types/onyx/ImportedSpreadsheetMemberData';

import type {TupleToUnion} from 'type-fest';

import {convertToBackendAmount} from './CurrencyUtils';
import {stripCommaFromAmount, stripSpacesFromAmount} from './MoneyRequestUtils';
import StringUtils from './StringUtils';

const APPROVER_COLUMN_FIELDS = ['approver', 'approvalLimit', 'overLimitApprover'] as const;

type ApproverColumnField = TupleToUnion<typeof APPROVER_COLUMN_FIELDS>;

const APPROVER_COLUMN_ROLE_PREFIXES: Record<ApproverColumnField, string> = {
    approver: CONST.CSV_IMPORT_COLUMNS.APPROVER,
    approvalLimit: CONST.CSV_IMPORT_COLUMNS.APPROVER_LIMIT,
    overLimitApprover: CONST.CSV_IMPORT_COLUMNS.APPROVER_OVER_LIMIT_APPROVER,
};

/**
 * The members import column role for one field of the approver at `position` in a member's workflow, counting from 1.
 */
function getApproverColumnRole(position: number, field: ApproverColumnField): string {
    return `${APPROVER_COLUMN_ROLE_PREFIXES[field]}${position}`;
}

/**
 * Which approver, and which of their fields, a members import column role is for. Undefined for every other role.
 */
function parseApproverColumnRole(role: string): {position: number; field: ApproverColumnField} | undefined {
    for (const field of APPROVER_COLUMN_FIELDS) {
        const prefix = APPROVER_COLUMN_ROLE_PREFIXES[field];
        const position = role.startsWith(prefix) ? Number(role.slice(prefix.length)) : Number.NaN;
        if (Number.isInteger(position) && position >= 1 && position <= CONST.IMPORT_SPREADSHEET.MAX_APPROVERS) {
            return {position, field};
        }
    }
    return undefined;
}

// cspell:disable
/**
 * Maps a spreadsheet header string to the CSV import column role it most likely represents, or an empty string when
 * no role matches. When `columnRoles` is provided, a detected role that is not selectable in the current context is
 * remapped to an available semantic equivalent (e.g. DATE -> POSTED_DATE for company cards) or discarded.
 */
function findColumnName(header: string, columnRoles?: ColumnRole[]): string {
    let attribute = '';
    const formattedHeader = String(header).toLowerCase().trim().replaceAll(' ', '');
    switch (formattedHeader) {
        case 'email':
        case 'emailaddress':
        case 'emailaddresses':
        case 'e-mail':
        case 'e-mailaddress':
        case 'e-mailaddresses':
            attribute = CONST.CSV_IMPORT_COLUMNS.EMAIL;
            break;

        case 'category':
        case 'categories':
        case 'updatedcategory':
            attribute = CONST.CSV_IMPORT_COLUMNS.CATEGORY;
            break;

        case 'updateddescription':
            attribute = CONST.CSV_IMPORT_COLUMNS.COMMENT;
            break;

        case 'glcode':
        case 'gl':
            attribute = CONST.CSV_IMPORT_COLUMNS.GL_CODE;
            break;

        case 'tag':
        case 'tags':
        case 'project':
        case 'projectcode':
        case 'customer':
        case 'name':
            attribute = 'name';
            break;

        case 'submitto':
        case 'submitsto':
            attribute = CONST.CSV_IMPORT_COLUMNS.SUBMIT_TO;
            break;

        case 'approveto':
        case 'approvesto':
            attribute = CONST.CSV_IMPORT_COLUMNS.APPROVE_TO;
            break;

        case 'payroll':
        case 'payrollid':
        case 'payrolls':
        case 'payrol':
        case 'payrollcode':
        case 'customfield2':
            attribute = CONST.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_2;
            break;

        case 'userid':
        case 'customfield1':
            attribute = CONST.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_1;
            break;

        case 'role':
            attribute = CONST.CSV_IMPORT_COLUMNS.ROLE;
            break;

        case 'total':
        case 'threshold':
        case 'reporttotal':
        case 'reporttotalthreshold':
        case 'approvallimit':
            attribute = CONST.CSV_IMPORT_COLUMNS.REPORT_THRESHOLD;
            break;

        case 'alternate':
        case 'alternateapprove':
        case 'alternateapproveto':
        case 'overlimitforwardsto':
            attribute = CONST.CSV_IMPORT_COLUMNS.APPROVE_TO_ALTERNATE;

            break;

        case 'destination':
            attribute = CONST.CSV_IMPORT_COLUMNS.DESTINATION;
            break;

        case 'subrate':
            attribute = CONST.CSV_IMPORT_COLUMNS.SUBRATE;
            break;

        case 'amount':
        case 'postedamount':
        case 'posted_amount':
            attribute = CONST.CSV_IMPORT_COLUMNS.AMOUNT;
            break;

        case 'cardnumber':
        case 'card':
        case 'number':
            attribute = CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER;
            break;

        case 'currency':
        case 'postedcurrency':
        case 'posted_currency':
            attribute = CONST.CSV_IMPORT_COLUMNS.CURRENCY;
            break;

        case 'posteddate':
        case 'posted_date':
        case 'postingdate':
        case 'posting_date':
            attribute = CONST.CSV_IMPORT_COLUMNS.POSTED_DATE;
            break;

        case 'date':
        case 'transactiondate':
        case 'transaction_date':
            attribute = CONST.CSV_IMPORT_COLUMNS.DATE;
            break;

        case 'merchant':
        case 'merchants':
        case 'vendor':
        case 'vendors':
            attribute = CONST.CSV_IMPORT_COLUMNS.MERCHANT;
            break;

        case 'merchantis':
            attribute = CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS;
            break;

        case 'merchantcontains':
            attribute = CONST.CSV_IMPORT_COLUMNS.MERCHANT_CONTAINS;
            break;

        case 'updatedmerchant':
        case 'newmerchant':
            attribute = CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT;
            break;

        case 'updatedtag':
        case 'newtag':
        case 'label':
        case 'labels':
            attribute = CONST.CSV_IMPORT_COLUMNS.TAG;
            break;

        case 'updatedvendor':
        case 'updatedsupplier':
            attribute = CONST.CSV_IMPORT_COLUMNS.VENDOR;
            break;

        case 'reimbursable':
        case 'reimburseable':
            attribute = CONST.CSV_IMPORT_COLUMNS.REIMBURSABLE;
            break;

        case 'preferredmerchantname':
        case 'preferredmerchant(vendor)name':
        case 'preferredvendorname':
            attribute = CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS;
            break;

        case 'billable':
            attribute = CONST.CSV_IMPORT_COLUMNS.BILLABLE;
            break;

        case 'rateid':
            attribute = CONST.CSV_IMPORT_COLUMNS.RATE_ID;
            break;

        case 'enabled':
        case 'enable':
            attribute = CONST.CSV_IMPORT_COLUMNS.ENABLED;
            break;

        case 'receiptsrequired':
        case 'requirereceiptsover':
        case 'maxamountnoreceipt':
            attribute = CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_RECEIPT;
            break;

        case 'itemisedreceiptrequirement':
        case 'itemizedreceiptrequirement':
        case 'itemisedreceiptsrequired':
        case 'itemizedreceiptsrequired':
        case 'requireitemizedreceiptsover':
        case 'maxamountnoitemizedreceipt':
            attribute = CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_ITEMIZED_RECEIPT;
            break;

        case 'comments':
        case 'requiredescription':
            attribute = CONST.CSV_IMPORT_COLUMNS.ARE_COMMENTS_REQUIRED;
            break;

        case 'commenthint':
        case 'descriptionhint':
            attribute = CONST.CSV_IMPORT_COLUMNS.COMMENT_HINT;
            break;

        case 'maxexpenseamount':
        case 'flagamountsover':
            attribute = CONST.CSV_IMPORT_COLUMNS.MAX_EXPENSE_AMOUNT;
            break;

        case 'expenselimittype':
            attribute = CONST.CSV_IMPORT_COLUMNS.EXPENSE_LIMIT_TYPE;
            break;

        default:
            break;
    }

    // Every approver has their own columns, like "Approver 2 limit", so those headers are matched by their pattern
    const approverHeaderMatch = /^approver(\d+)(limit|overlimitapprover)?$/.exec(formattedHeader.replaceAll(/[-_]/g, ''));
    const approverPosition = Number(approverHeaderMatch?.at(1));
    if (!attribute && approverPosition >= 1 && approverPosition <= CONST.IMPORT_SPREADSHEET.MAX_APPROVERS) {
        const approverHeaderField = approverHeaderMatch?.at(2);
        if (approverHeaderField === 'limit') {
            attribute = getApproverColumnRole(approverPosition, 'approvalLimit');
        } else if (approverHeaderField) {
            attribute = getApproverColumnRole(approverPosition, 'overLimitApprover');
        } else {
            attribute = getApproverColumnRole(approverPosition, 'approver');
        }
    }

    // A bare "Description" header is ambiguous across import flows (e.g. bank CSVs use it for the
    // transaction descriptor), so it only auto-maps to the updated-description action in the merchant
    // rules import, which is the only flow offering the MERCHANT_IS column role.
    if (!attribute && formattedHeader === 'description' && columnRoles?.some((role) => role.value === CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS)) {
        attribute = CONST.CSV_IMPORT_COLUMNS.COMMENT;
    }

    // If the detected attribute isn't available in the current context but a semantic equivalent is,
    // remap to it. This handles e.g. "Date" headers in company card imports where DATE is not a
    // valid column role but POSTED_DATE is.
    if (columnRoles && attribute) {
        const isAvailable = columnRoles.some((role) => role.value === attribute);
        if (!isAvailable) {
            if (attribute === CONST.CSV_IMPORT_COLUMNS.DATE && columnRoles.some((role) => role.value === CONST.CSV_IMPORT_COLUMNS.POSTED_DATE)) {
                return CONST.CSV_IMPORT_COLUMNS.POSTED_DATE;
            }
            if (attribute === CONST.CSV_IMPORT_COLUMNS.MERCHANT && columnRoles.some((role) => role.value === CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT)) {
                return CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT;
            }
            // Payroll headers map to the members-import CUSTOM_FIELD_2 role, but the categories import offers PAYROLL_CODE instead.
            if (attribute === CONST.CSV_IMPORT_COLUMNS.CUSTOM_FIELD_2 && columnRoles.some((role) => role.value === CONST.CSV_IMPORT_COLUMNS.PAYROLL_CODE)) {
                return CONST.CSV_IMPORT_COLUMNS.PAYROLL_CODE;
            }
            // Only tag-like headers remap from NAME to TAG, so headers like "Name" or "Customer" stay
            // unmapped in contexts without a NAME role instead of silently becoming a tag column.
            if (attribute === CONST.CSV_IMPORT_COLUMNS.NAME && ['tag', 'tags'].includes(formattedHeader) && columnRoles.some((role) => role.value === CONST.CSV_IMPORT_COLUMNS.TAG)) {
                return CONST.CSV_IMPORT_COLUMNS.TAG;
            }
            return '';
        }
    }

    return attribute;
}
// cspell:enable

/**
 * Computes the complete company card CSV column mapping for a freshly uploaded file.
 *
 * A single deterministic pass is used - instead of letting each column auto-detect independently - so that a property
 * is never pre-selected on more than one column. Detection is header-first: it reads the current file's header row,
 * which is correct no matter how the columns are ordered. The saved layout is only a positional fallback for the roles
 * the headers did not resolve, and it is never allowed to overwrite a header match or land on a column another role
 * already claimed. This is what keeps a re-import of a differently-structured file from producing nonsensical or
 * duplicated pre-selections.
 *
 * @param spreadsheetData - The spreadsheet data in column-major format (each entry is a column, index 0 is the header)
 * @param savedColumnMappings - Saved mappings from uploadLayoutSettings, keyed by field role with a column index value
 * @param availableColumnRoles - The field roles currently selectable in the mapping UI
 * @returns A complete map of every column index to a role (or `ignore`)
 */
function getCompanyCardColumnMappings(spreadsheetData: string[][], savedColumnMappings: Record<string, string> | undefined, availableColumnRoles: string[]): Record<number, string> {
    const numColumns = spreadsheetData.length;
    const validRoles = new Set(availableColumnRoles);
    const rolesForDetection: ColumnRole[] = availableColumnRoles.map((value) => ({text: '', value}));

    const columns: Record<number, string> = {};
    const usedRoles = new Set<string>();
    for (let index = 0; index < numColumns; index++) {
        columns[index] = CONST.CSV_IMPORT_COLUMNS.IGNORE;
    }

    // Header-first detection against the current file. The first column that resolves to a role claims it, so a role
    // is assigned to at most one column even when several headers would match the same one.
    for (let index = 0; index < numColumns; index++) {
        const header = spreadsheetData.at(index)?.at(0) ?? '';
        const detectedRole = findColumnName(header, rolesForDetection);
        if (!detectedRole || detectedRole === CONST.CSV_IMPORT_COLUMNS.IGNORE || !validRoles.has(detectedRole) || usedRoles.has(detectedRole)) {
            continue;
        }
        columns[index] = detectedRole;
        usedRoles.add(detectedRole);
    }

    // Positional fallback from the saved layout, only for roles the headers did not resolve and only onto columns that
    // are still unmapped - so it neither overrides a correct header match nor duplicates a role onto a second column.
    for (const [role, indexValue] of Object.entries(savedColumnMappings ?? {})) {
        if (role === CONST.CSV_IMPORT_COLUMNS.IGNORE || !validRoles.has(role) || usedRoles.has(role)) {
            continue;
        }

        // A saved externalID index is ambiguous: the company cards import appends a synthetic externalID column when
        // the user maps no Unique ID, and that index is indistinguishable from a Unique ID the user mapped to the last
        // column. Restoring it could point Unique ID at an unrelated column of the new file, whose repeated values
        // would make the backend dedupe valid transactions, so leave it for the user to map. A header that names the
        // column outright is unambiguous, so the detection pass above can still claim it.
        if (role === CONST.CSV_IMPORT_COLUMNS.EXTERNAL_ID) {
            continue;
        }
        const index = Number(indexValue);
        if (!Number.isInteger(index) || index < 0 || index >= numColumns || columns[index] !== CONST.CSV_IMPORT_COLUMNS.IGNORE) {
            continue;
        }
        columns[index] = role;
        usedRoles.add(role);
    }

    return columns;
}

function findDuplicate(array: string[]): string | null {
    const frequencyCounter: Record<string, number> = {};

    for (const item of array) {
        if (item !== CONST.CSV_IMPORT_COLUMNS.IGNORE) {
            if (frequencyCounter[item]) {
                return item;
            }
            frequencyCounter[item] = (frequencyCounter[item] || 0) + 1;
        }
    }

    return null;
}

/**
 * Converts a numeric index to an Excel-style column name.
 */
function numberToColumn(index: number): string {
    let column = '';
    let number = index;

    // Loop until 'number' is less than 0
    while (number >= 0) {
        // Calculate the character corresponding to the current 'number' and prepend it to the 'column' string
        column = String.fromCharCode((number % 26) + 65) + column;
        // Update 'number' to move to the next significant digit in base-26, adjusting for 0-based index
        number = Math.floor(number / 26) - 1;
    }
    return column;
}

/**
 * Generates an array of Excel-style column names with a specified length.
 */
function generateColumnNames(length: number) {
    return Array.from({length}, (_, i) => numberToColumn(i));
}

/**
 * Normalizes an amount cell from an imported spreadsheet by removing its currency marker, grouping separators, and whitespace.
 */
function normalizeImportedAmount(value: string, currencySymbol?: string, currencyCode?: string): string {
    const tokens = [currencySymbol, currencyCode].filter((token): token is string => !!token).map((token) => StringUtils.escapeRegExp(token));
    const withoutCurrency = tokens.length > 0 ? value.trim().replace(new RegExp(`^(?:${tokens.join('|')})\\s*|\\s*(?:${tokens.join('|')})$`, 'i'), '') : value;
    return stripCommaFromAmount(stripSpacesFromAmount(withoutCurrency.replaceAll(/\p{Sc}/gu, '')));
}

type ImportedApproversError = {
    /** Explains what is wrong with the row's approvers */
    translationKey: 'spreadsheet.approversOutOfOrder' | 'spreadsheet.approverRepeated' | 'spreadsheet.approvalLimitIncomplete';

    /** The row's number in the spreadsheet, counting the header row */
    rowNumber: number;
};

type GetImportedApproversParams = {
    /** The spreadsheet cells, column by column */
    spreadsheetData: string[][];

    /** The role each column is mapped to, in column order */
    mappedColumns: string[];

    containsHeader: boolean;
    currencySymbol?: string;
    currency?: string;
};

/**
 * Reads the approvers each member row of a members import lists, in order, and finds the first row listing them in a way a
 * workflow can't hold. Approval limits are converted to cents, so their cells are expected to hold valid amounts.
 */
function getImportedApprovers({spreadsheetData, mappedColumns, containsHeader, currencySymbol, currency}: GetImportedApproversParams): {
    approversByRow: ImportedSpreadsheetApprover[][];
    error?: ImportedApproversError;
} {
    const getCell = (position: number, field: ApproverColumnField, rowIndex: number) => {
        const columnIndex = mappedColumns.indexOf(getApproverColumnRole(position, field));
        return columnIndex === -1 ? '' : String(spreadsheetData.at(columnIndex)?.at(rowIndex) ?? '').trim();
    };
    const firstRowIndex = containsHeader ? 1 : 0;
    const rowCount = Math.max((spreadsheetData.at(0)?.length ?? 0) - firstRowIndex, 0);

    let error: ImportedApproversError | undefined;
    const approversByRow = Array.from({length: rowCount}, (_, index) => {
        const rowIndex = index + firstRowIndex;
        const rowNumber = rowIndex + 1;
        const approvers: ImportedSpreadsheetApprover[] = [];
        let hasSkippedApprover = false;
        for (let position = 1; position <= CONST.IMPORT_SPREADSHEET.MAX_APPROVERS; position++) {
            const email = getCell(position, 'approver', rowIndex).toLowerCase();
            const approvalLimitAmount = normalizeImportedAmount(getCell(position, 'approvalLimit', rowIndex), currencySymbol, currency);
            const overLimitForwardsTo = getCell(position, 'overLimitApprover', rowIndex).toLowerCase();
            if (!email) {
                hasSkippedApprover = true;
                if (approvalLimitAmount || overLimitForwardsTo) {
                    error ??= {translationKey: 'spreadsheet.approversOutOfOrder', rowNumber};
                }
                continue;
            }

            if (hasSkippedApprover) {
                error ??= {translationKey: 'spreadsheet.approversOutOfOrder', rowNumber};
            }
            // Like in the workflow editor, an approver can't be their own over limit approver either: the reports over their limit
            // would go back to them, which ends the workflow before the approvers after them
            if (approvers.some((approver) => approver.email === email) || overLimitForwardsTo === email) {
                error ??= {translationKey: 'spreadsheet.approverRepeated', rowNumber};
            }

            // Like in the workflow editor, a limit needs someone to receive the reports over it, and the other way around
            const approvalLimit = approvalLimitAmount ? convertToBackendAmount(Number.parseFloat(approvalLimitAmount)) : 0;
            if (approvalLimit > 0 !== !!overLimitForwardsTo) {
                error ??= {translationKey: 'spreadsheet.approvalLimitIncomplete', rowNumber};
            }
            approvers.push(approvalLimit > 0 && overLimitForwardsTo ? {email, approvalLimit, overLimitForwardsTo} : {email});
        }
        return approvers;
    });

    return {approversByRow, error};
}

export {findColumnName, findDuplicate, generateColumnNames, getApproverColumnRole, getCompanyCardColumnMappings, getImportedApprovers, normalizeImportedAmount, parseApproverColumnRole};
