import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import {getCurrencySymbol} from './CurrencyUtils';
import {getAllReportActions} from './ReportActionsUtils';
import {getReportTransactions} from './ReportUtils';
import {getCreated, isPartialTransaction} from './TransactionUtils';

type FormulaPart = {
    /** The original definition from the formula */
    definition: string;

    /** The type of formula part (report, field, user, etc.) */
    type: ValueOf<typeof FORMULA_PART_TYPES>;

    /** The field path for accessing data (e.g., ['type'], ['startdate'], ['total']) */
    fieldPath: string[];

    /** Functions to apply to the computed value (e.g., ['frontPart']) */
    functions: string[];
};

type FormulaContext = {
    report: Report;
    policy: OnyxEntry<Policy>;
    transaction?: Transaction;
};

const FORMULA_PART_TYPES = {
    REPORT: 'report',
    FIELD: 'field',
    USER: 'user',
    FREETEXT: 'freetext',
} as const;

/**
 * Extract formula parts from a formula string, handling nested braces and escapes
 * Based on OldDot Formula.extract method
 */
function extract(formula: string, opener = '{', closer = '}'): string[] {
    if (!formula || typeof formula !== 'string') {
        return [];
    }

    const letters = formula.split('');
    const sections: string[] = [];
    let nesting = 0;
    let start = 0;

    for (let i = 0; i < letters.length; i++) {
        // Found an escape character, skip the next character
        if (letters.at(i) === '\\') {
            i++;
            continue;
        }

        // Found an opener, save the spot
        if (letters.at(i) === opener) {
            if (nesting === 0) {
                start = i;
            }
            nesting++;
        }

        // Found a closer, decrement the nesting and possibly extract it
        if (letters.at(i) === closer && nesting > 0) {
            nesting--;
            if (nesting === 0) {
                sections.push(formula.substring(start, i + 1));
            }
        }
    }

    return sections;
}

/**
 * Parse a formula string into an array of formula parts
 * Based on OldDot Formula.parse method
 */
function parse(formula: string): FormulaPart[] {
    if (!formula || typeof formula !== 'string') {
        return [];
    }

    const parts: FormulaPart[] = [];
    const formulaParts = extract(formula);

    // If no formula parts found, treat the entire string as free text
    if (formulaParts.length === 0) {
        if (formula.trim()) {
            parts.push({
                definition: formula,
                type: FORMULA_PART_TYPES.FREETEXT,
                fieldPath: [],
                functions: [],
            });
        }
        return parts;
    }

    // Process the formula by splitting on formula parts to preserve free text
    let lastIndex = 0;

    formulaParts.forEach((part) => {
        const partIndex = formula.indexOf(part, lastIndex);

        // Add any free text before this formula part
        if (partIndex > lastIndex) {
            const freeText = formula.substring(lastIndex, partIndex);
            if (freeText) {
                parts.push({
                    definition: freeText,
                    type: FORMULA_PART_TYPES.FREETEXT,
                    fieldPath: [],
                    functions: [],
                });
            }
        }

        // Add the formula part
        parts.push(parsePart(part));
        lastIndex = partIndex + part.length;
    });

    // Add any remaining free text after the last formula part
    if (lastIndex < formula.length) {
        const freeText = formula.substring(lastIndex);
        if (freeText) {
            parts.push({
                definition: freeText,
                type: FORMULA_PART_TYPES.FREETEXT,
                fieldPath: [],
                functions: [],
            });
        }
    }

    return parts;
}

/**
 * Parse a single formula part definition into a FormulaPart object
 * Based on OldDot Formula.parsePart method
 */
function parsePart(definition: string): FormulaPart {
    const part: FormulaPart = {
        definition,
        type: FORMULA_PART_TYPES.FREETEXT,
        fieldPath: [],
        functions: [],
    };

    // If it doesn't start and end with braces, it's free text
    if (!definition.startsWith('{') || !definition.endsWith('}')) {
        return part;
    }

    // Remove the braces and trim
    const cleanDefinition = definition.slice(1, -1).trim();
    if (!cleanDefinition) {
        return part;
    }

    // Split on | to separate functions
    const segments = cleanDefinition.split('|');
    const fieldSegment = segments.at(0);
    const functions = segments.slice(1);

    // Split the field segment on : to get the field path
    const fieldPath = fieldSegment?.split(':');
    const type = fieldPath?.at(0)?.toLowerCase();

    // Determine the formula part type
    if (type === 'report') {
        part.type = FORMULA_PART_TYPES.REPORT;
    } else if (type === 'field') {
        part.type = FORMULA_PART_TYPES.FIELD;
    } else if (type === 'user') {
        part.type = FORMULA_PART_TYPES.USER;
    }

    // Set field path (excluding the type)
    part.fieldPath = fieldPath?.slice(1) ?? [];
    part.functions = functions;

    return part;
}

/**
 * Compute the value of a formula given a context
 */
function compute(formula: string, context: FormulaContext): string {
    if (!formula || typeof formula !== 'string') {
        return '';
    }

    const parts = parse(formula);
    let result = '';

    for (const part of parts) {
        let value = '';

        switch (part.type) {
            case FORMULA_PART_TYPES.REPORT:
                value = computeReportPart(part, context);
                value = value === '' ? part.definition : value;
                break;
            case FORMULA_PART_TYPES.FIELD:
                value = computeFieldPart(part);
                break;
            case FORMULA_PART_TYPES.USER:
                value = computeUserPart(part);
                break;
            case FORMULA_PART_TYPES.FREETEXT:
                value = part.definition;
                break;
            default:
                // If we don't recognize the part type, use the original definition
                value = part.definition;
        }

        // Apply any functions to the computed value
        value = applyFunctions(value, part.functions);
        result += value;
    }

    return result;
}

/**
 * Compute the value of a report formula part
 */
function computeReportPart(part: FormulaPart, context: FormulaContext): string {
    const {report, policy} = context;
    const [field, format] = part.fieldPath;

    if (!field) {
        return part.definition;
    }

    switch (field.toLowerCase()) {
        case 'type':
            return formatType(report.type);
        case 'startdate':
            return formatDate(getOldestTransactionDate(report.reportID, context), format);
        case 'total':
            return formatAmount(report.total, getCurrencySymbol(report.currency ?? '') ?? report.currency);
        case 'currency':
            return report.currency ?? '';
        case 'policyname':
        case 'workspacename':
            return policy?.name ?? '';
        case 'created':
            // Backend will always return at least one report action (of type created) and its date is equal to report's creation date
            // We can make it slightly more efficient in the future by ensuring report.created is always present in backend's responses
            return formatDate(getOldestReportActionDate(report.reportID), format);
        default:
            return part.definition;
    }
}

/**
 * Compute the value of a field formula part
 */
function computeFieldPart(part: FormulaPart): string {
    // Field computation will be implemented later
    return part.definition;
}

/**
 * Compute the value of a user formula part
 */
function computeUserPart(part: FormulaPart): string {
    // User computation will be implemented later
    return part.definition;
}

/**
 * Apply functions to a computed value
 */
function applyFunctions(value: string, functions: string[]): string {
    let result = value;

    for (const func of functions) {
        const [functionName, ...args] = func.split(':');

        switch (functionName.toLowerCase()) {
            case 'frontpart':
                result = getFrontPart(result);
                break;
            case 'substr':
                result = getSubstring(result, args);
                break;
            case 'domain':
                result = getDomainName(result);
                break;
            case 'leftpad':
                result = getLeftPadded(result, args);
                break;
            default:
                // Unknown function, leave value as is
                break;
        }
    }

    return result;
}

/**
 * Get the front part of an email or first word of a string
 */
function getFrontPart(value: string): string {
    const trimmed = value.trim();

    // If it's an email, return the part before @
    if (trimmed.includes('@')) {
        return trimmed.split('@').at(0) ?? '';
    }

    // Otherwise, return the first word
    return trimmed.split(' ').at(0) ?? '';
}

/**
 * Get the domain name of an email or URL
 */
function getDomainName(value: string): string {
    const trimmed = value.trim();

    // If it's an email, return the part after @
    if (trimmed.includes('@')) {
        return trimmed.split('@').at(1) ?? '';
    }

    return '';
}

/**
 * Get substring of a value
 */
function getSubstring(value: string, args: string[]): string {
    const start = parseInt(args.at(0) ?? '', 10) || 0;
    const length = args.at(1) ? parseInt(args.at(1) ?? '', 10) : undefined;

    if (length !== undefined) {
        return value.substring(start, start + length);
    }

    return value.substring(start);
}

/**
 * Left pad a value with a character to a specific length
 */
function getLeftPadded(value: string, args: string[]): string {
    const padChar = args.at(0) ?? ' ';
    const targetLength = parseInt(args.at(1) ?? '', 10) || value.length;
    
    return value.padStart(targetLength, padChar);
}

/**
 * Get ordinal suffix for a day (st, nd, rd, th)
 */
function getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

/**
 * Format a date value with comprehensive token-based date format support
 */
function formatDate(dateString: string | undefined, format = 'yyyy-MM-dd'): string {
    if (!dateString) {
        return '';
    }

    try {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Use a two-phase placeholder system to prevent token conflicts
        let result = format;
        
        // Get time values for time formatting
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const hours12 = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        const meridiem = hours >= 12 ? 'pm' : 'am';
        const meridiemUpperCase = hours >= 12 ? 'PM' : 'AM';
        
        // Phase 1: Replace tokens with unique placeholders
        const tokens = [
            // Special combinations first
            { token: 'jS', value: `${day}${getOrdinalSuffix(day)}` },
            
            // Year formats (longest to shortest)
            { token: 'yyyy', value: year.toString() },
            { token: 'YYYY', value: year.toString() },
            { token: 'yy', value: year.toString().slice(-2) },
            { token: 'Y', value: year.toString() },
            { token: 'y', value: year.toString().slice(-2) },
            
            // Month formats (longest to shortest)
            { token: 'MMMM', value: monthNames.at(month - 1) ?? '' },
            { token: 'MMM', value: shortMonthNames.at(month - 1) ?? '' },
            { token: 'MM', value: month.toString().padStart(2, '0') },
            { token: 'M', value: month.toString() },
            { token: 'F', value: monthNames.at(month - 1) ?? '' },
            { token: 'n', value: month.toString() },
            
            // Day formats (longest to shortest) 
            { token: 'dd', value: day.toString().padStart(2, '0') },
            { token: 'd', value: day.toString().padStart(2, '0') },
            { token: 'j', value: day.toString() },
            { token: 'S', value: getOrdinalSuffix(day) },
            
            // Time formats (longest to shortest)
            { token: 'tt', value: meridiemUpperCase },
            { token: 'hh', value: hours12.toString().padStart(2, '0') },
            { token: 'HH', value: hours.toString().padStart(2, '0') },
            { token: 'mm', value: minutes.toString().padStart(2, '0') },
            { token: 'ss', value: seconds.toString().padStart(2, '0') },
            { token: 'H', value: hours.toString() },
            { token: 'h', value: hours12.toString() },
            { token: 'G', value: hours.toString() },
            { token: 'g', value: hours12.toString() },
            { token: 'i', value: minutes.toString().padStart(2, '0') },
            { token: 's', value: seconds.toString().padStart(2, '0') },
            { token: 'A', value: meridiemUpperCase },
            { token: 'a', value: meridiem },
        ];
        
        // Sort tokens by length (longest first)
        tokens.sort((a, b) => b.token.length - a.token.length);
        
        // Phase 1: Replace tokens with unique placeholders (using only digits and special chars)
        const placeholderMap: Record<string, string> = {};
        for (let i = 0; i < tokens.length; i++) {
            const { token, value } = tokens.at(i)!;
            const placeholder = `###${i.toString().padStart(3, '0')}###`;
            const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            
            if (result.includes(token)) {
                result = result.replace(regex, placeholder);
                placeholderMap[placeholder] = value;
            }
        }
        
        // Phase 2: Replace placeholders with actual values
        for (const [placeholder, value] of Object.entries(placeholderMap)) {
            result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }
        
        return result;
    } catch {
        return '';
    }
}

/**
 * Format an amount value
 */
function formatAmount(amount: number | undefined, currency: string | undefined): string {
    if (amount === undefined) {
        return '';
    }

    const absoluteAmount = Math.abs(amount);
    const formattedAmount = (absoluteAmount / 100).toFixed(2);

    if (currency) {
        return `${currency}${formattedAmount}`;
    }

    return formattedAmount;
}

/**
 * Get the date of the oldest report action for a given report
 */
function getOldestReportActionDate(reportID: string): string | undefined {
    if (!reportID) {
        return undefined;
    }

    const reportActions = getAllReportActions(reportID);
    if (!reportActions || Object.keys(reportActions).length === 0) {
        return undefined;
    }

    let oldestDate: string | undefined;

    Object.values(reportActions).forEach((action) => {
        if (!action?.created) {
            return;
        }

        if (oldestDate && action.created > oldestDate) {
            return;
        }
        oldestDate = action.created;
    });

    return oldestDate;
}

/**
 * Format a report type to its human-readable string
 */
function formatType(type: string | undefined): string {
    if (!type) {
        return '';
    }

    const typeMapping: Record<string, string> = {
        [CONST.REPORT.TYPE.EXPENSE]: 'Expense Report',
        [CONST.REPORT.TYPE.INVOICE]: 'Invoice',
        [CONST.REPORT.TYPE.CHAT]: 'Chat',
        [CONST.REPORT.UNSUPPORTED_TYPE.BILL]: 'Bill',
        [CONST.REPORT.UNSUPPORTED_TYPE.PAYCHECK]: 'Paycheck',
        [CONST.REPORT.TYPE.IOU]: 'IOU',
        [CONST.REPORT.TYPE.TASK]: 'Task',
        trip: 'Trip',
    };

    return typeMapping[type.toLowerCase()] || type;
}

/**
 * Get the date of the oldest transaction for a given report
 */
function getOldestTransactionDate(reportID: string, context?: FormulaContext): string | undefined {
    if (!reportID) {
        return undefined;
    }

    const transactions = getReportTransactions(reportID);
    if (!transactions || transactions.length === 0) {
        return new Date().toISOString();
    }

    let oldestDate: string | undefined;

    transactions.forEach((transaction) => {
        // Use updated transaction data if available and matches this transaction
        const currentTransaction = context?.transaction && transaction.transactionID === context.transaction.transactionID ? context.transaction : transaction;

        const created = getCreated(currentTransaction);
        if (!created) {
            return;
        }
        if (oldestDate && created >= oldestDate) {
            return;
        }
        if (isPartialTransaction(currentTransaction)) {
            return;
        }
        oldestDate = created;
    });

    return oldestDate;
}

export {FORMULA_PART_TYPES, compute, extract, parse};

export type {FormulaContext, FormulaPart};
