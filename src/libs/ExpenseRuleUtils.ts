import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {ExpenseRuleForm} from '@src/types/form';
import type {ExpenseRule, TaxRate} from '@src/types/onyx';
import {getDecodedCategoryName} from './CategoryUtils';
import Parser from './Parser';
import {getCleanedTagName} from './PolicyUtils';
import StringUtils from './StringUtils';

type ChangeKey = 'billable' | 'category' | 'comment' | 'merchant' | 'reimbursable' | 'tag' | 'tax';

const TRANSLATION_KEY_MAP = {
    billable: {update: 'expenseRulesPage.changes.billableUpdate', partial: 'expenseRulesPage.changes.billable'},
    category: {update: 'expenseRulesPage.changes.categoryUpdate', partial: 'expenseRulesPage.changes.category'},
    comment: {update: 'expenseRulesPage.changes.commentUpdate', partial: 'expenseRulesPage.changes.comment'},
    merchant: {update: 'expenseRulesPage.changes.merchantUpdate', partial: 'expenseRulesPage.changes.merchant'},
    reimbursable: {update: 'expenseRulesPage.changes.reimbursableUpdate', partial: 'expenseRulesPage.changes.reimbursable'},
    tag: {update: 'expenseRulesPage.changes.tagUpdate', partial: 'expenseRulesPage.changes.tag'},
    tax: {update: 'expenseRulesPage.changes.taxUpdate', partial: 'expenseRulesPage.changes.tax'},
} satisfies Record<ChangeKey, {update: TranslationPaths; partial: TranslationPaths}>;

type ValueForKey = {
    billable: boolean;
    category: string;
    comment: string;
    merchant: string;
    reimbursable: boolean;
    tag: string;
    tax: string;
};

function formatExpenseRuleChanges(rule: ExpenseRule, translate: LocaleContextProps['translate']): string {
    const changes: string[] = [];

    const addChange = <K extends ChangeKey>(key: K, value: ValueForKey[K]) => {
        const translationKey = TRANSLATION_KEY_MAP[key][changes.length === 0 ? 'update' : 'partial'];
        changes.push(translate(translationKey as TranslationPaths, value as TranslationParameters<typeof translationKey>[0]));
    };

    if (rule.billable) {
        addChange('billable', rule.billable === 'true');
    }
    if (rule.category) {
        addChange('category', getDecodedCategoryName(rule.category));
    }
    if (rule.comment) {
        const commentMarkdown = Parser.htmlToMarkdown(rule.comment);
        addChange('comment', commentMarkdown);
    }
    if (rule.merchant) {
        addChange('merchant', rule.merchant);
    }
    if (rule.reimbursable) {
        addChange('reimbursable', rule.reimbursable === 'true');
    }
    if (rule.tag) {
        addChange('tag', getCleanedTagName(rule.tag));
    }
    if (rule.tax?.field_id_TAX?.value) {
        addChange('tax', rule.tax.field_id_TAX.value);
    }
    if (rule.report) {
        changes.push(translate('expenseRulesPage.changes.report', rule.report));
    }

    const formatted = changes.join(', ');

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function extractRuleFromForm(form: ExpenseRuleForm, taxRate?: TaxRate) {
    // Convert markdown comment to HTML for storage
    const commentHTML = form.comment ? Parser.replace(form.comment) : undefined;

    const rule: ExpenseRule = {
        billable: form.billable,
        category: form.category,
        comment: commentHTML,
        createReport: form.createReport,
        merchant: form.merchant,
        merchantToMatch: form.merchantToMatch,
        reimbursable: form.reimbursable,
        report: form.report,
        tag: form.tag,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tax: form.tax && taxRate ? {field_id_TAX: {externalID: form.tax, value: taxRate.value}} : undefined,
    };
    return rule;
}

function getKeyForRule(rule: ExpenseRule) {
    // Use a stable key based on ordered properties
    const stableKey = [
        rule.merchantToMatch,
        rule.merchant,
        rule.category,
        rule.tag,
        rule.comment,
        rule.reimbursable,
        rule.billable,
        rule.report,
        rule.createReport,
        rule.tax?.field_id_TAX?.externalID,
    ]
        .filter(Boolean)
        .join('|');
    return `${StringUtils.hash(stableKey)}`;
}

export {formatExpenseRuleChanges, extractRuleFromForm, getKeyForRule};
