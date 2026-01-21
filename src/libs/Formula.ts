import {endOfDay, endOfMonth, endOfWeek, getDay, lastDayOfMonth, set, startOfMonth, startOfWeek, subDays} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {PersonalDetails, Policy, PolicyReportField, Report, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {convertToDisplayString, convertToDisplayStringWithoutCurrency, isValidCurrencyCode} from './CurrencyUtils';
import {formatDate} from './FormulaDatetime';
import getBase62ReportID from './getBase62ReportID';
import Log from './Log';
import {getAllReportActions} from './ReportActionsUtils';
import {getHumanReadableStatus, getMoneyRequestSpendBreakdown, getReportTransactions} from './ReportUtils';
import {getCreated, isPartialTransaction, isTransactionPendingDelete} from './TransactionUtils';

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

type MinimalTransaction = Pick<Transaction, 'transactionID' | 'reportID' | 'created' | 'amount' | 'currency' | 'merchant' | 'pendingAction'>;

type FormulaContext = {
    report: Report;
    policy: OnyxEntry<Policy>;
    transaction?: Transaction;
    submitterPersonalDetails?: PersonalDetails;
    managerPersonalDetails?: PersonalDetails;
    allTransactions?: Record<string, Transaction>;
    fieldValues?: Record<string, string>;
    fieldsByName?: Record<string, PolicyReportField>;
    visitedFields?: Set<string>;
};

type FieldList = Record<string, {name: string; defaultValue: string}>;

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
function extract(formula?: string, opener = '{', closer = '}'): string[] {
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
function parse(formula?: string): FormulaPart[] {
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

    for (const part of formulaParts) {
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
    }

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
 * Check if the report field formula value is containing circular references, e.g example:  A -> A,  A->B->A,  A->B->C->A, etc
 */
function hasCircularReferences(fieldValue: string, fieldName: string, fieldList?: FieldList): boolean {
    const formulaPartDefinitions = extract(fieldValue);
    if (formulaPartDefinitions.length === 0 || isEmptyObject(fieldList)) {
        return false;
    }

    const visitedFields = new Set<string>();
    const fieldsByName = new Map<string, {name: string; defaultValue: string}>(Object.values(fieldList).map((field) => [field.name, field]));

    // Helper function to check if a field has circular references
    const hasCircularReferencesRecursive = (currentFieldValue: string, currentFieldName: string): boolean => {
        // If we've already visited this field in the current path, return true
        if (visitedFields.has(currentFieldName)) {
            return true;
        }

        // Add current field to the visited lists
        visitedFields.add(currentFieldName);

        // Extract all formula part definitions
        const currentFormulaPartDefinitions = extract(currentFieldValue);

        for (const formulaPartDefinition of currentFormulaPartDefinitions) {
            const part = parsePart(formulaPartDefinition);

            // Only check field references (skip report, user, or freetext)
            if (part.type !== FORMULA_PART_TYPES.FIELD) {
                continue;
            }

            // Get the referenced field name (first element in fieldPath)
            const referencedFieldName = part.fieldPath.at(0)?.trim();
            if (!referencedFieldName) {
                continue;
            }

            // Check if this reference creates a cycle
            if (referencedFieldName === fieldName || visitedFields.has(referencedFieldName)) {
                return true;
            }

            const referencedField = fieldsByName.get(referencedFieldName);

            if (referencedField?.defaultValue) {
                // Recursively check the referenced field
                if (hasCircularReferencesRecursive(referencedField.defaultValue, referencedFieldName)) {
                    return true;
                }
            }
        }

        // Remove current field from visited lists
        visitedFields.delete(currentFieldName);
        return false;
    };

    return hasCircularReferencesRecursive(fieldValue, fieldName);
}

/**
 * Check if a formula part is a submission info part (report:submit:*)
 */
function isSubmissionInfoPart(part: FormulaPart): boolean {
    return part.type === FORMULA_PART_TYPES.REPORT && part.fieldPath.at(0)?.toLowerCase() === 'submit';
}

/**
 * Compute the value of a formula given a context
 */
function compute(formula?: string, context?: FormulaContext): string {
    if (!formula || typeof formula !== 'string') {
        return '';
    }
    if (!context) {
        return '';
    }

    const parts = parse(formula);
    let result = '';

    for (const part of parts) {
        let value = '';

        switch (part.type) {
            case FORMULA_PART_TYPES.REPORT:
                value = computeReportPart(part, context);
                // Apply fallback to formula definition for empty values, except for submission info
                // Submission info explicitly returns empty strings when data is missing (matches backend)
                if (value === '' && !isSubmissionInfoPart(part)) {
                    value = part.definition;
                }
                break;
            case FORMULA_PART_TYPES.FIELD:
                value = computeFieldPart(part, context);
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
 * Compute auto-reporting info for a report formula part
 */
function computeAutoReportingInfo(part: FormulaPart, context: FormulaContext, subField: string | undefined, format: string | undefined): string {
    const {report, policy} = context;

    if (!subField) {
        return part.definition;
    }

    const {startDate, endDate} = getAutoReportingDates(policy, report);

    switch (subField.toLowerCase()) {
        case 'start':
            return formatDate(startDate?.toISOString(), format);
        case 'end':
            return formatDate(endDate?.toISOString(), format);
        default:
            return part.definition;
    }
}

/**
 * Compute the value of a report formula part
 */
function computeReportPart(part: FormulaPart, context: FormulaContext): string {
    const {report, policy, allTransactions} = context;
    const [field, ...additionalPath] = part.fieldPath;
    // Reconstruct format string by joining additional path elements with ':'
    // This handles format strings with colons like 'HH:mm:ss'
    const format = additionalPath.length > 0 ? additionalPath.join(':') : undefined;

    if (!field) {
        return part.definition;
    }

    switch (field.toLowerCase()) {
        case 'id':
            return getBase62ReportID(Number(report.reportID));
        case 'status':
            return formatStatus(report.statusNum);
        case 'expensescount':
            return String(getExpensesCount(report, allTransactions));
        case 'type':
            return formatType(report.type);
        case 'startdate':
            return formatDate(getOldestTransactionDate(report.reportID, context), format);
        case 'enddate':
            return formatDate(getNewestTransactionDate(report.reportID, context), format);
        case 'total': {
            const formattedAmount = formatAmount(report.total, report.currency, format);
            // Return empty string when conversion needed (formatAmount returns null for unavailable conversions)
            return formattedAmount ?? '';
        }
        case 'reimbursable': {
            const formattedAmount = formatAmount(getMoneyRequestSpendBreakdown(report).reimbursableSpend, report.currency, format);
            return formattedAmount ?? '';
        }
        case 'currency':
            return report.currency ?? '';
        case 'policyname':
        case 'workspacename':
            return policy?.name ?? '';
        case 'created':
            // Backend will always return at least one report action (of type created) and its date is equal to report's creation date
            // We can make it slightly more efficient in the future by ensuring report.created is always present in backend's responses
            return formatDate(getOldestReportActionDate(report.reportID), format);
        case 'submit': {
            return computeSubmitPart(additionalPath, context);
        }
        case 'autoreporting': {
            const subField = additionalPath.at(0);
            // For multi-part formulas, format is everything after the subfield
            const autoReportingFormat = additionalPath.length > 1 ? additionalPath.slice(1).join(':') : undefined;
            return computeAutoReportingInfo(part, context, subField, autoReportingFormat);
        }
        default:
            return part.definition;
    }
}

/**
 * Get the number of expenses in a report
 * @param report - The report to get expenses for
 * @param allTransactions - Optional map of all transactions. If provided, uses this instead of fetching from Onyx
 */
function getExpensesCount(report: Report, allTransactions?: Record<string, Transaction>): number {
    if (!report.reportID) {
        return 0;
    }

    if (allTransactions) {
        const transactions = Object.values(allTransactions).filter((transaction): transaction is Transaction => !!transaction && transaction.reportID === report.reportID);
        return transactions?.filter((transaction) => !isTransactionPendingDelete(transaction))?.length ?? 0;
    }

    return report.transactionCount ?? 0;
}

/**
 * Format a report status number to human-readable string
 */
function formatStatus(statusNum: number | undefined): string {
    if (statusNum === undefined) {
        return '';
    }

    return getHumanReadableStatus(statusNum);
}

/**
 * Check if a formula string contains field references ({field:X})
 * Uses quick string check before expensive parsing for performance
 */
function hasFieldReferences(formula: string | undefined): boolean {
    if (!formula?.includes('{field:')) {
        return false;
    }
    const parsed = parse(formula);
    return parsed.some((part) => part.type === FORMULA_PART_TYPES.FIELD);
}

/**
 * Compute the value of a field formula part with recursive resolution support
 */
function computeFieldPart(part: FormulaPart, context?: FormulaContext): string {
    const fieldName = part.fieldPath.at(0)?.toLowerCase();

    if (!fieldName) {
        return part.definition;
    }

    // Prevent circular references by tracking visited fields
    const visited = context?.visitedFields ?? new Set<string>();
    if (visited.has(fieldName)) {
        return part.definition;
    }

    // If we have the full field definitions, we can recursively resolve dependencies
    if (context?.fieldsByName?.[fieldName]) {
        const field = context.fieldsByName[fieldName];
        if (hasFieldReferences(field.defaultValue)) {
            visited.add(fieldName);
            return compute(field.defaultValue, {...context, visitedFields: visited});
        }
        return field.value ?? field.defaultValue ?? '';
    }

    // Fallback to flat value map
    if (context?.fieldValues?.[fieldName]) {
        return context.fieldValues[fieldName];
    }

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
 * Format an amount value
 * @returns The formatted amount string, or null if currency conversion is needed (unavailable on frontend)
 */
function formatAmount(amount: number | undefined, currency: string | undefined, displayCurrency?: string): string | null {
    if (amount === undefined) {
        return '';
    }

    const absoluteAmount = Math.abs(amount);

    try {
        const trimmedDisplayCurrency = displayCurrency?.trim().toUpperCase();
        if (trimmedDisplayCurrency) {
            if (trimmedDisplayCurrency === 'NOSYMBOL') {
                return convertToDisplayStringWithoutCurrency(absoluteAmount, currency);
            }

            // Check if format is a valid currency code (e.g., USD, EUR, eur)
            if (!isValidCurrencyCode(trimmedDisplayCurrency)) {
                return '';
            }

            // If a currency conversion is needed (displayCurrency differs from the source),
            // return null so the backend can compute it.
            // We can only compute the value optimistically when the amount is 0.
            if (absoluteAmount !== 0 && currency !== trimmedDisplayCurrency) {
                return null;
            }

            return convertToDisplayString(absoluteAmount, trimmedDisplayCurrency);
        }

        if (currency && isValidCurrencyCode(currency)) {
            return convertToDisplayString(absoluteAmount, currency);
        }

        return convertToDisplayStringWithoutCurrency(absoluteAmount, currency);
    } catch (error) {
        Log.hmmm('[Formula] formatAmount failed', {error, amount, currency, displayCurrency});
        return '';
    }
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

    for (const action of Object.values(reportActions)) {
        if (!action?.created) {
            continue;
        }

        if (oldestDate && action.created > oldestDate) {
            continue;
        }
        oldestDate = action.created;
    }

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
 * Get all transactions for a report, including any context transaction.
 * Updates an existing transaction if it matches the context or adds it if new.
 */
function getAllReportTransactionsWithContext(reportID: string, context?: FormulaContext): Transaction[] {
    const transactions = [...getReportTransactions(reportID)];
    const contextTransaction = context?.transaction;

    if (contextTransaction?.transactionID && contextTransaction.reportID === reportID) {
        const transactionIndex = transactions.findIndex((transaction) => transaction?.transactionID === contextTransaction.transactionID);
        if (transactionIndex >= 0) {
            transactions[transactionIndex] = contextTransaction;
        } else {
            transactions.push(contextTransaction);
        }
    }

    return transactions;
}

/**
 * Get the date of the oldest transaction for a given report
 */
function getOldestTransactionDate(reportID: string, context?: FormulaContext): string | undefined {
    if (!reportID) {
        return undefined;
    }

    const transactions = getAllReportTransactionsWithContext(reportID, context);
    if (!transactions || transactions.length === 0) {
        return new Date().toISOString();
    }

    let oldestDate: string | undefined;

    for (const transaction of transactions) {
        const created = getCreated(transaction);
        if (!created) {
            continue;
        }
        // Skip transactions with pending deletion (offline deletes) to calculate dates properly.
        if (transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        if (oldestDate && created >= oldestDate) {
            continue;
        }
        if (isPartialTransaction(transaction)) {
            continue;
        }
        oldestDate = created;
    }

    return oldestDate;
}

/**
 * Calculate monthly reporting period for a specific day offset
 */
function getMonthlyReportingPeriod(currentDate: Date, offsetDay: number): {startDate: Date; endDate: Date} {
    const currentDay = currentDate.getDate();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (currentDay <= offsetDay) {
        // We haven't reached the reporting day yet - period is from last month's offset+1 to this month's offset
        const prevMonth = currentMonth - 1;
        const prevYear = prevMonth < 0 ? currentYear - 1 : currentYear;
        const adjustedPrevMonth = prevMonth < 0 ? 11 : prevMonth;

        const prevMonthDays = lastDayOfMonth(new Date(prevYear, adjustedPrevMonth, 1)).getDate();
        const prevOffsetDay = Math.min(offsetDay, prevMonthDays);

        const currentMonthDays = lastDayOfMonth(currentDate).getDate();
        const currentOffsetDay = Math.min(offsetDay, currentMonthDays);

        return {
            startDate: new Date(prevYear, adjustedPrevMonth, prevOffsetDay + 1, 0, 0, 0, 0),
            endDate: new Date(currentYear, currentMonth, currentOffsetDay, 23, 59, 59, 999),
        };
    }

    // We've passed the reporting day - period is from this month's offset+1 to next month's offset
    const nextMonth = currentMonth + 1;
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
    const adjustedNextMonth = nextMonth > 11 ? 0 : nextMonth;

    const currentMonthDays = lastDayOfMonth(currentDate).getDate();
    const currentOffsetDay = Math.min(offsetDay, currentMonthDays);

    const nextMonthDays = lastDayOfMonth(new Date(nextYear, adjustedNextMonth, 1)).getDate();
    const nextOffsetDay = Math.min(offsetDay, nextMonthDays);

    return {
        startDate: new Date(currentYear, currentMonth, currentOffsetDay + 1, 0, 0, 0, 0),
        endDate: new Date(nextYear, adjustedNextMonth, nextOffsetDay, 23, 59, 59, 999),
    };
}

/**
 * Calculate monthly reporting period for last business day
 */
function getMonthlyLastBusinessDayPeriod(currentDate: Date): {startDate: Date; endDate: Date} {
    let endDate = endOfMonth(currentDate);

    // Move backward to find last business day (Mon-Fri)
    while (getDay(endDate) === 0 || getDay(endDate) === 6) {
        endDate = subDays(endDate, 1);
    }

    return {
        startDate: startOfMonth(currentDate),
        endDate: endOfDay(endDate),
    };
}

/**
 * Calculate the start and end dates for auto-reporting based on the frequency and current date
 */
function getAutoReportingDates(policy: OnyxEntry<Policy>, report: Report, currentDate = new Date()): {startDate: Date | undefined; endDate: Date | undefined} {
    const frequency = policy?.autoReportingFrequency;
    const offset = policy?.autoReportingOffset;

    // Return undefined if no frequency is set
    if (!frequency || !policy) {
        return {startDate: undefined, endDate: undefined};
    }

    let startDate: Date;
    let endDate: Date;

    switch (frequency) {
        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY: {
            // Weekly: use the app's configured week start convention (Monday)
            const weekStartsOn = CONST.WEEK_STARTS_ON;
            startDate = startOfWeek(currentDate, {weekStartsOn});
            endDate = endOfWeek(currentDate, {weekStartsOn});
            break;
        }

        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY: {
            // Semi-monthly: 1st-15th or 16th-end of month
            const dayOfMonth = currentDate.getDate();
            if (dayOfMonth <= 15) {
                startDate = startOfMonth(currentDate);
                endDate = set(currentDate, {date: 15, hours: 23, minutes: 59, seconds: 59, milliseconds: 999});
            } else {
                startDate = set(currentDate, {date: 16, hours: 0, minutes: 0, seconds: 0, milliseconds: 0});
                endDate = endOfMonth(currentDate);
            }
            break;
        }

        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY: {
            // Monthly reporting with different offset configurations
            if (offset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                const period = getMonthlyLastBusinessDayPeriod(currentDate);
                startDate = period.startDate;
                endDate = period.endDate;
            } else if (typeof offset === 'number') {
                const period = getMonthlyReportingPeriod(currentDate, offset);
                startDate = period.startDate;
                endDate = period.endDate;
            } else {
                // Default to full month
                startDate = startOfMonth(currentDate);
                endDate = endOfMonth(currentDate);
            }
            break;
        }

        case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP: {
            // For trip-based, use oldest transaction as start
            const oldestTransactionDateString = getOldestTransactionDate(report.reportID);
            startDate = oldestTransactionDateString ? new Date(oldestTransactionDateString) : currentDate;
            endDate = currentDate;
            break;
        }

        default:
            // For any other frequency, use current date as both start and end
            startDate = currentDate;
            endDate = currentDate;
            break;
    }

    return {startDate, endDate};
}

/**
 * Get the date of the newest transaction for a given report
 */
function getNewestTransactionDate(reportID: string, context?: FormulaContext): string | undefined {
    if (!reportID) {
        return undefined;
    }

    const transactions = getAllReportTransactionsWithContext(reportID, context);
    if (!transactions || transactions.length === 0) {
        return new Date().toISOString();
    }

    let newestDate: string | undefined;

    for (const transaction of transactions) {
        const created = getCreated(transaction);
        if (!created) {
            continue;
        }
        // Skip transactions with pending deletion (offline deletes) to calculate dates properly.
        if (transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        if (newestDate && created <= newestDate) {
            continue;
        }
        if (isPartialTransaction(transaction)) {
            continue;
        }
        newestDate = created;
    }

    return newestDate;
}

/**
 * Compute the value of a report:submit:* formula part
 * Handles nested paths like submit:from:firstname, submit:to:email, submit:date
 */
function computeSubmitPart(path: string[], context: FormulaContext): string {
    const [direction, ...subPath] = path;

    if (!direction) {
        return '';
    }

    switch (direction.toLowerCase()) {
        case 'from':
            return computePersonalDetailsField(subPath, context.submitterPersonalDetails, context.policy);
        case 'to':
            return computePersonalDetailsField(subPath, context.managerPersonalDetails, context.policy);
        case 'date': {
            // TODO: Use report.submitted once backend adds it (issue #568267)
            // Using report.created as placeholder until then
            const submittedDate = context.report.created;
            const format = subPath.length > 0 ? subPath.join(':') : undefined;
            return formatDate(submittedDate, format);
        }
        default:
            return '';
    }
}

/**
 * Compute personal details information for either submitter (from) or manager (to)
 */
function computePersonalDetailsField(path: string[], personalDetails: PersonalDetails | undefined, policy: OnyxEntry<Policy>): string {
    const [field] = path;

    if (!personalDetails || !field) {
        return '';
    }

    switch (field.toLowerCase()) {
        case 'firstname':
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return personalDetails.firstName || personalDetails.login || '';
        case 'lastname':
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return personalDetails.lastName || personalDetails.login || '';
        case 'fullname':
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return personalDetails.displayName || personalDetails.login || '';
        case 'email':
            return personalDetails.login ?? '';
        // userid/customfield1 returns employeeUserID from policy.employeeList
        // TODO: Check policy.glCodes once backend adds it (issue #568268)
        case 'userid':
        case 'customfield1': {
            const email = personalDetails.login;
            if (!email || !policy?.employeeList) {
                return '';
            }
            // eslint-disable-next-line rulesdir/no-default-id-values
            return policy.employeeList[email]?.employeeUserID ?? '';
        }
        // payrollid/customfield2 returns employeePayrollID from policy.employeeList
        case 'payrollid':
        case 'customfield2': {
            const email = personalDetails.login;
            if (!email || !policy?.employeeList) {
                return '';
            }
            // eslint-disable-next-line rulesdir/no-default-id-values
            return policy.employeeList[email]?.employeePayrollID ?? '';
        }
        default:
            return '';
    }
}

/**
 * Resolve the display value for a report field, handling {field:X} references
 */
function resolveReportFieldValue(
    field: PolicyReportField,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    fieldValues: Record<string, string>,
    fieldsByName: Record<string, PolicyReportField>,
): string {
    const fieldValue = field.value ?? field.defaultValue ?? '';

    if (!report || !hasFieldReferences(field.defaultValue)) {
        return fieldValue;
    }

    return compute(field.defaultValue, {report, policy, fieldValues, fieldsByName});
}

export {FORMULA_PART_TYPES, compute, parse, hasCircularReferences, resolveReportFieldValue};

export type {FormulaContext, FieldList, MinimalTransaction};
