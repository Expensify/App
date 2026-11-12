import CONST from '@src/CONST';
import type {ImportedSpreadsheet, PolicyCategories, PolicyCategory} from '@src/types/onyx';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

import type {OnyxEntry} from 'react-native-onyx';

import {convertToBackendAmount} from './CurrencyUtils';

/** Matches a number that uses commas as thousands separators, such as "299,393.00", which is how Expensify Classic exports amounts */
const THOUSANDS_SEPARATED_NUMBER_REGEX = /^\d{1,3}(,\d{3})+(\.\d+)?$/;

/**
 * Converts a CSV cell to a number. Commas are only stripped when they are valid thousands separators,
 * so a value such as "1,5" stays invalid instead of being read as 15.
 */
function parseCsvNumber(value: string): number {
    return Number(THOUSANDS_SEPARATED_NUMBER_REGEX.test(value) ? value.replaceAll(',', '') : value);
}

/**
 * Parses a CSV cell value for receipt requirement columns.
 * Mirrors the OD import logic: "required"/"always_required" → 0,
 * "not_required" → DISABLED_MAX_EXPENSE_VALUE, numeric string → number.
 * Returns undefined for unmapped columns, empty/default values, or invalid input.
 */
function parseCsvReceiptValue(raw: string | undefined): number | undefined {
    if (raw === undefined) {
        return undefined;
    }
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed || trimmed === 'default') {
        return undefined;
    }
    if (trimmed === 'required' || trimmed === 'always_required') {
        return 0;
    }
    if (trimmed === 'not_required') {
        return CONST.DISABLED_MAX_EXPENSE_VALUE;
    }
    const num = parseCsvNumber(trimmed);
    if (Number.isFinite(num) && num >= 0) {
        return convertToBackendAmount(num);
    }
    return undefined;
}

/**
 * Parses a CSV cell value for the max expense amount column.
 * Returns undefined for empty or invalid input so the existing value is left unchanged.
 */
function parseCsvAmountValue(raw: string | undefined): number | undefined {
    const trimmed = raw?.trim();
    if (!trimmed) {
        return undefined;
    }
    const num = parseCsvNumber(trimmed);
    return Number.isFinite(num) && num >= 0 ? convertToBackendAmount(num) : undefined;
}

/**
 * Parses a CSV cell value for the expense limit type column.
 * Returns undefined for anything other than a known expense limit type.
 */
function parseCsvExpenseLimitType(raw: string | undefined): PolicyCategoryExpenseLimitType | undefined {
    const trimmed = raw?.trim().toLowerCase();
    return Object.values(CONST.POLICY.EXPENSE_LIMIT_TYPES).find((type) => type === trimmed);
}

/**
 * Builds the categories to import from the mapped spreadsheet columns.
 * Unmapped rule columns are left out so they don't overwrite the values of existing categories.
 */
function buildCategoriesFromSpreadsheet(spreadsheet: OnyxEntry<ImportedSpreadsheet>, policyCategories: OnyxEntry<PolicyCategories>): PolicyCategory[] | undefined {
    const {containsHeader = true} = spreadsheet ?? {};
    const columns = Object.values(spreadsheet?.columns ?? {});
    const categoriesNamesColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.NAME);
    const categoriesGLCodeColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.GL_CODE);
    const categoriesEnabledColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.ENABLED);
    const categoriesMaxAmountNoReceiptColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_RECEIPT);
    const categoriesMaxAmountNoItemizedReceiptColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.MAX_AMOUNT_NO_ITEMIZED_RECEIPT);
    const categoriesPayrollCodeColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.PAYROLL_CODE);
    const categoriesAreCommentsRequiredColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.ARE_COMMENTS_REQUIRED);
    const categoriesCommentHintColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.COMMENT_HINT);
    const categoriesMaxExpenseAmountColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.MAX_EXPENSE_AMOUNT);
    const categoriesExpenseLimitTypeColumn = columns.findIndex((column) => column === CONST.CSV_IMPORT_COLUMNS.EXPENSE_LIMIT_TYPE);
    const categoriesNames = spreadsheet?.data[categoriesNamesColumn].map((name) => name);
    const categoriesEnabled = categoriesEnabledColumn !== -1 ? spreadsheet?.data[categoriesEnabledColumn].map((enabled) => enabled) : [];
    const categoriesGLCode = categoriesGLCodeColumn !== -1 ? spreadsheet?.data[categoriesGLCodeColumn].map((glCode) => glCode) : [];
    const categoriesMaxAmountNoReceipt = categoriesMaxAmountNoReceiptColumn !== -1 ? spreadsheet?.data[categoriesMaxAmountNoReceiptColumn] : [];
    const categoriesMaxAmountNoItemizedReceipt = categoriesMaxAmountNoItemizedReceiptColumn !== -1 ? spreadsheet?.data[categoriesMaxAmountNoItemizedReceiptColumn] : [];
    const categoriesPayrollCode = categoriesPayrollCodeColumn !== -1 ? spreadsheet?.data[categoriesPayrollCodeColumn] : [];
    const categoriesAreCommentsRequired = categoriesAreCommentsRequiredColumn !== -1 ? spreadsheet?.data[categoriesAreCommentsRequiredColumn] : [];
    const categoriesCommentHint = categoriesCommentHintColumn !== -1 ? spreadsheet?.data[categoriesCommentHintColumn] : [];
    const categoriesMaxExpenseAmount = categoriesMaxExpenseAmountColumn !== -1 ? spreadsheet?.data[categoriesMaxExpenseAmountColumn] : [];
    const categoriesExpenseLimitType = categoriesExpenseLimitTypeColumn !== -1 ? spreadsheet?.data[categoriesExpenseLimitTypeColumn] : [];

    return categoriesNames?.slice(containsHeader ? 1 : 0).map((name, index) => {
        const categoryAlreadyExists = policyCategories?.[name];
        const existingGLCodeOrDefault = categoryAlreadyExists?.['GL Code'] ?? '';
        const dataIndex = containsHeader ? index + 1 : index;

        const parsedMaxAmountNoReceipt = categoriesMaxAmountNoReceiptColumn !== -1 ? parseCsvReceiptValue(categoriesMaxAmountNoReceipt?.[dataIndex]?.toString()) : undefined;
        const parsedMaxAmountNoItemizedReceipt =
            categoriesMaxAmountNoItemizedReceiptColumn !== -1 ? parseCsvReceiptValue(categoriesMaxAmountNoItemizedReceipt?.[dataIndex]?.toString()) : undefined;
        const parsedMaxExpenseAmount = categoriesMaxExpenseAmountColumn !== -1 ? parseCsvAmountValue(categoriesMaxExpenseAmount?.[dataIndex]?.toString()) : undefined;
        const parsedExpenseLimitType = categoriesExpenseLimitTypeColumn !== -1 ? parseCsvExpenseLimitType(categoriesExpenseLimitType?.[dataIndex]?.toString()) : undefined;

        return {
            name,
            enabled: categoriesEnabledColumn !== -1 ? ['true', 'yes'].includes(categoriesEnabled?.[dataIndex]?.toString().trim().toLowerCase() ?? '') : true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'GL Code': categoriesGLCodeColumn !== -1 ? (categoriesGLCode?.[dataIndex] ?? '') : existingGLCodeOrDefault,
            ...(parsedMaxAmountNoReceipt !== undefined && {maxAmountNoReceipt: parsedMaxAmountNoReceipt}),
            ...(parsedMaxAmountNoItemizedReceipt !== undefined && {maxAmountNoItemizedReceipt: parsedMaxAmountNoItemizedReceipt}),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ...(categoriesPayrollCodeColumn !== -1 && {'Payroll Code': categoriesPayrollCode?.[dataIndex] ?? ''}),
            ...(categoriesAreCommentsRequiredColumn !== -1 && {
                areCommentsRequired: ['true', 'yes'].includes(categoriesAreCommentsRequired?.[dataIndex]?.toString().trim().toLowerCase() ?? ''),
            }),
            ...(categoriesCommentHintColumn !== -1 && {commentHint: categoriesCommentHint?.[dataIndex] ?? ''}),
            ...(parsedMaxExpenseAmount !== undefined && {maxExpenseAmount: parsedMaxExpenseAmount}),
            ...(parsedExpenseLimitType !== undefined && {expenseLimitType: parsedExpenseLimitType}),
        };
    });
}

export {buildCategoriesFromSpreadsheet, parseCsvAmountValue, parseCsvReceiptValue};
