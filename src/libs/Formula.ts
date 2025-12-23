import type {ValueOf} from 'type-fest';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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

export {FORMULA_PART_TYPES, parse, hasCircularReferences};

export type {FieldList};
