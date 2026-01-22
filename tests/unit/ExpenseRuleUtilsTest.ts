/* eslint-disable @typescript-eslint/naming-convention */
import {extractRuleFromForm, formatExpenseRuleChanges, getKeyForRule} from '@libs/ExpenseRuleUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {ExpenseRuleForm} from '@src/types/form';
import type {ExpenseRule, TaxRate} from '@src/types/onyx';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const LOCALE = CONST.LOCALES.EN;

describe('formatExpenseRuleChanges', () => {
    beforeEach(() => {
        IntlStore.load(LOCALE);
        return waitForBatchedUpdates();
    });

    it('formats billable, category, comment and tax entries in order', () => {
        const rule: ExpenseRule = {
            merchantToMatch: 'merchant1',
            tax: {field_id_TAX: {externalID: 'TAX_123', value: '5%'}},
            comment: 'memo',
            billable: 'true',
            category: 'office',
        };

        const result = formatExpenseRuleChanges(rule, translateLocal);
        expect(result).toBe('Update expense billable, Update category to "office", Change description to "memo", Update tax rate to "5%"');
    });
});

describe('extractRuleFromForm', () => {
    it('maps form fields to rule and includes tax when taxRate provided', () => {
        const form: ExpenseRuleForm = {
            billable: 'true',
            category: 'office',
            comment: 'monthly',
            createReport: false,
            merchant: 'Amazon',
            merchantToMatch: 'contains',
            reimbursable: 'true',
            report: 'monthly',
            tag: 'supplies',
            tax: 'TAX_123',
        };

        const taxRate: TaxRate = {name: 'Tax Rate 1', value: '7.5'};
        const rule = extractRuleFromForm(form, taxRate);

        expect(rule.billable).toBe(form.billable);
        expect(rule.category).toBe(form.category);
        expect(rule.comment).toBe(form.comment);
        expect(rule.createReport).toBe(form.createReport);
        expect(rule.merchant).toBe(form.merchant);
        expect(rule.merchantToMatch).toBe(form.merchantToMatch);
        expect(rule.reimbursable).toBe(form.reimbursable);
        expect(rule.report).toBe(form.report);
        expect(rule.tag).toBe(form.tag);

        expect(rule.tax).toBeDefined();
        expect(rule.tax?.field_id_TAX).toEqual({externalID: form.tax, value: taxRate.value});
    });

    it('does not include tax when taxRate is not provided or form.tax is falsy', () => {
        const form: ExpenseRuleForm = {
            billable: 'false',
            category: 'office',
            comment: '',
            createReport: false,
            merchant: 'Amazon',
            merchantToMatch: '',
            reimbursable: 'true',
            report: '',
            tag: '',
            tax: '',
        };

        const rule = extractRuleFromForm(form);
        expect(rule.tax).toBeUndefined();

        const formTaxWithoutRate: ExpenseRuleForm = {
            billable: 'false',
            category: 'office',
            comment: '',
            createReport: false,
            merchant: 'Amazon',
            merchantToMatch: '',
            reimbursable: 'true',
            report: '',
            tag: '',
            tax: 'TAX_123',
        };

        const ruleTaxWithoutRate = extractRuleFromForm(formTaxWithoutRate, undefined);
        expect(ruleTaxWithoutRate.tax).toBeUndefined();
    });

    it('should correctly map form values to ExpenseRule', () => {
        const form = {
            merchantToMatch: 'Test',
            category: 'Food',
            billable: 'true',
            tax: 'TAX_123',
        } as ExpenseRuleForm;
        const taxRate: TaxRate = {name: 'Tax Rate 1', value: '7.5'};

        const result = extractRuleFromForm(form, taxRate);
        expect(result.merchantToMatch).toBe('Test');
        expect(result.category).toBe('Food');
        expect(result.billable).toBe('true');
        expect(result.tax).toEqual({field_id_TAX: {externalID: 'TAX_123', value: '7.5'}});
        expect(result.comment).toBe(undefined);
    });
});

describe('getKeyForRule', () => {
    it('returns same key for identical rules (order independent)', () => {
        const ruleA: ExpenseRule = {
            merchantToMatch: 'contains',
            merchant: 'Amazon',
            category: 'office',
            tag: 'supplies',
            comment: 'monthly office supplies',
            reimbursable: 'true',
            billable: 'false',
            report: 'monthly',
            createReport: true,
            tax: {field_id_TAX: {externalID: 'TAX1', value: '10%'}},
        };

        const ruleB: ExpenseRule = {
            merchant: 'Amazon',
            merchantToMatch: 'contains',
            category: 'office',
            comment: 'monthly office supplies',
            tag: 'supplies',
            reimbursable: 'true',
            billable: 'false',
            report: 'monthly',
            createReport: true,
            tax: {field_id_TAX: {externalID: 'TAX1', value: '10%'}},
        };

        expect(getKeyForRule(ruleA)).toBe(getKeyForRule(ruleB));
    });

    it('different merchant results in different keys', () => {
        const base: ExpenseRule = {
            merchantToMatch: 'contains',
            merchant: 'Amazon',
            category: 'office',
            tag: 'supplies',
            comment: 'monthly office supplies',
            reimbursable: 'true',
            billable: 'false',
            report: 'monthly',
            createReport: true,
            tax: {field_id_TAX: {externalID: 'TAX1', value: '10%'}},
        };

        const modified = {
            ...base,
            merchant: 'Walmart',
        } as unknown as ExpenseRule;

        expect(getKeyForRule(base)).not.toBe(getKeyForRule(modified));
    });

    it('tax.externalID affects the generated key', () => {
        const withTaxA: ExpenseRule = {
            merchantToMatch: 'contains',
            merchant: 'Amazon',
            category: 'office',
            reimbursable: 'true',
            tax: {field_id_TAX: {externalID: 'TAX_A', value: '10%'}},
        };

        const withTaxB: ExpenseRule = {
            merchantToMatch: 'contains',
            merchant: 'Amazon',
            category: 'office',
            reimbursable: 'true',
            tax: {field_id_TAX: {externalID: 'TAX_B', value: '10%'}},
        };

        expect(getKeyForRule(withTaxA)).not.toBe(getKeyForRule(withTaxB));
    });

    it('ignores falsy properties: undefined vs empty string produce same key', () => {
        const ruleUndefinedTag: ExpenseRule = {
            merchantToMatch: 'Amazon',
            category: 'office',
            tag: undefined,
            comment: 'c',
        };

        const ruleEmptyTag = {
            merchantToMatch: 'Amazon',
            category: 'office',
            tag: '',
            comment: 'c',
        };

        expect(getKeyForRule(ruleUndefinedTag)).toBe(getKeyForRule(ruleEmptyTag));
    });
});
