import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import {getCurrencySymbol} from './CurrencyUtils';

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
        if (letters[i] === '\\') {
            i++;
            continue;
        }

        // Found an opener, save the spot
        if (letters[i] === opener) {
            if (nesting === 0) {
                start = i;
            }
            nesting++;
        }

        // Found a closer, decrement the nesting and possibly extract it
        if (letters[i] === closer && nesting > 0) {
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
    let remainingFormula = formula;
    let lastIndex = 0;

    formulaParts.forEach((part) => {
        const partIndex = remainingFormula.indexOf(part, lastIndex);

        // Add any free text before this formula part
        if (partIndex > lastIndex) {
            const freeText = remainingFormula.substring(lastIndex, partIndex);
            if (freeText.trim()) {
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
    if (lastIndex < remainingFormula.length) {
        const freeText = remainingFormula.substring(lastIndex);
        if (freeText.trim()) {
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
    const fieldSegment = segments[0];
    const functions = segments.slice(1);

    // Split the field segment on : to get the field path
    const fieldPath = fieldSegment.split(':');
    const type = fieldPath[0]?.toLowerCase();

    // Determine the formula part type
    if (type === 'report') {
        part.type = FORMULA_PART_TYPES.REPORT;
    } else if (type === 'field') {
        part.type = FORMULA_PART_TYPES.FIELD;
    } else if (type === 'user') {
        part.type = FORMULA_PART_TYPES.USER;
    }

    // Set field path (excluding the type)
    part.fieldPath = fieldPath.slice(1);
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
                break;
            case FORMULA_PART_TYPES.FIELD:
                value = computeFieldPart(part, context);
                break;
            case FORMULA_PART_TYPES.USER:
                value = computeUserPart(part, context);
                break;
            case FORMULA_PART_TYPES.FREETEXT:
                value = part.definition.trim();
                break;
            default:
                // If we don't recognize the part type, use the original definition
                value = part.definition;
        }

        // Apply any functions to the computed value
        value = applyFunctions(value, part.functions);
        result = result === '' ? value : `${result} ${value}`.trim(); // Concatenate with space
    }

    return result;
}

/**
 * Compute the value of a report formula part
 */
function computeReportPart(part: FormulaPart, context: FormulaContext): string {
    const {report, policy} = context;
    const [field] = part.fieldPath;

    if (!field) {
        return part.definition;
    }

    switch (field.toLowerCase()) {
        case 'type':
            return 'Expense Report'; // Default report type for now
        case 'startdate':
            return formatDate(report.lastVisibleActionCreated);
        case 'total':
            return formatAmount(report.total, getCurrencySymbol(report.currency ?? '') ?? report.currency);
        case 'currency':
            return report.currency ?? '';
        case 'policyname':
        case 'workspacename':
            return policy?.name ?? '';
        case 'created':
            return formatDate(report.lastVisibleActionCreated, CONST.DATE.FNS_FORMAT_STRING);
        default:
            return part.definition;
    }
}

/**
 * Compute the value of a field formula part
 */
function computeFieldPart(part: FormulaPart, context: FormulaContext): string {
    // Field computation will be implemented later
    return part.definition;
}

/**
 * Compute the value of a user formula part
 */
function computeUserPart(part: FormulaPart, context: FormulaContext): string {
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
        return trimmed.split('@')[0];
    }

    // Otherwise, return the first word
    return trimmed.split(' ')[0];
}

/**
 * Get substring of a value
 */
function getSubstring(value: string, args: string[]): string {
    const start = parseInt(args[0], 10) || 0;
    const length = args[1] ? parseInt(args[1], 10) : undefined;

    if (length !== undefined) {
        return value.substr(start, length);
    }

    return value.substr(start);
}

/**
 * Format a date value
 */
function formatDate(dateString: string | undefined, format = CONST.DATE.FNS_FORMAT_STRING): string {
    if (!dateString) {
        return '';
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }

        // Simple date formatting - this could be enhanced with a proper date library
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        if (format === CONST.DATE.FNS_FORMAT_STRING) {
            return `${month}/${day}/${year}`;
        }

        return `${year}-${month}-${day}`;
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
 * Check if a string contains formula parts
 */
function isFormula(str: string): boolean {
    return extract(str).length > 0;
}

export {extract, parse, compute, isFormula, FORMULA_PART_TYPES};

export type {FormulaPart, FormulaContext};
