import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {CurrencyListActionsContextType} from '@components/CurrencyListContextProvider';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {SpendRuleForm} from '@src/types/form';
import {isSpendRuleCategory} from '@src/types/form/SpendRuleForm';
import type {ExpensifyCardSettings} from '@src/types/onyx';
import type {ExpensifyCardRule, ExpensifyCardRuleFilter} from '@src/types/onyx/ExpensifyCardSettings';
import {convertToBackendAmount} from './CurrencyUtils';
import DateUtils from './DateUtils';

function isSpendRuleASTNode(value: unknown): value is ExpensifyCardRuleFilter {
    return !!value && typeof value === 'object' && 'left' in value && 'operator' in value && 'right' in value;
}

function combineSpendRuleASTNodes(nodes: ExpensifyCardRuleFilter[], operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>): ExpensifyCardRuleFilter | undefined {
    const [firstNode, ...remainingNodes] = nodes;
    if (!firstNode) {
        return undefined;
    }

    return remainingNodes.reduce<ExpensifyCardRuleFilter>((accumulator, node) => ({left: accumulator, operator, right: node}), firstNode);
}

function buildSpendRuleAST(spendRuleValues: SpendRuleForm, existingCreated?: string): ExpensifyCardRule | undefined {
    const cardIDs = spendRuleValues.cardIDs ?? [];
    if (cardIDs.length === 0) {
        return undefined;
    }

    const merchantNames = (spendRuleValues.merchantNames ?? []).map((merchant) => merchant.trim()).filter((merchant) => merchant !== '');
    const merchantMatchTypes = spendRuleValues.merchantMatchTypes ?? [];
    const categories = (spendRuleValues.categories ?? []).map((category) => category.trim()).filter((category) => category !== '');
    const maxAmount = spendRuleValues.maxAmount?.trim() ?? '';

    const cardNode: ExpensifyCardRuleFilter = {
        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        right: cardIDs,
    };

    const exactMerchantNames = merchantNames.filter((_, index) => merchantMatchTypes.at(index) === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);
    const containsMerchantNames = merchantNames.filter((_, index) => merchantMatchTypes.at(index) !== CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);
    const merchantNodes: ExpensifyCardRuleFilter[] = [];

    if (exactMerchantNames.length > 0) {
        merchantNodes.push({
            left: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
            operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            right: exactMerchantNames,
        });
    }

    if (containsMerchantNames.length > 0) {
        merchantNodes.push({
            left: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
            operator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            right: containsMerchantNames,
        });
    }

    const merchantNode = combineSpendRuleASTNodes(merchantNodes, CONST.SEARCH.SYNTAX_OPERATORS.OR);
    const categoryNode =
        categories.length > 0
            ? {
                  left: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
                  operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                  right: categories,
              }
            : undefined;

    const criteriaNode = combineSpendRuleASTNodes([merchantNode, categoryNode].filter(Boolean) as ExpensifyCardRuleFilter[], CONST.SEARCH.SYNTAX_OPERATORS.OR);
    const amountNode =
        maxAmount !== ''
            ? {
                  left: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT,
                  operator:
                      spendRuleValues.restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK
                          ? CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN
                          : CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO,
                  right: [maxAmount],
              }
            : undefined;

    const ruleNode = combineSpendRuleASTNodes(
        [amountNode, criteriaNode].filter(Boolean) as ExpensifyCardRuleFilter[],
        spendRuleValues.restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK ? CONST.SEARCH.SYNTAX_OPERATORS.OR : CONST.SEARCH.SYNTAX_OPERATORS.AND,
    );
    const filters = combineSpendRuleASTNodes([cardNode, ruleNode].filter(Boolean) as ExpensifyCardRuleFilter[], CONST.SEARCH.SYNTAX_OPERATORS.AND);

    if (!filters) {
        return undefined;
    }

    return {
        created: existingCreated ?? DateUtils.getDBTime(),
        action: spendRuleValues.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW,
        filters,
    };
}

function getSpendRuleFormValuesFromCardRule(cardRule: ExpensifyCardRule): SpendRuleForm | undefined {
    if (!cardRule || typeof cardRule !== 'object' || !('filters' in cardRule) || !('action' in cardRule)) {
        return undefined;
    }

    if (!isSpendRuleASTNode(cardRule.filters)) {
        return undefined;
    }

    const formValues: SpendRuleForm = {
        cardIDs: [],
        restrictionAction: cardRule.action,
        merchantNames: [],
        merchantMatchTypes: [],
        categories: [],
        maxAmount: '',
    };

    const traverseFilters = (filterNode: ExpensifyCardRuleFilter) => {
        const {left, operator, right} = filterNode;

        if (isSpendRuleASTNode(left)) {
            traverseFilters(left);
        }

        if (isSpendRuleASTNode(right)) {
            traverseFilters(right);
            return;
        }

        if (typeof left !== 'string' || !Array.isArray(right)) {
            return;
        }

        if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
            formValues.cardIDs = right;
            return;
        }

        if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
            formValues.maxAmount = typeof right === 'string' ? right : (right.at(0) ?? '');
            return;
        }

        if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY) {
            formValues.categories = right.filter(isSpendRuleCategory);
            return;
        }

        if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT) {
            formValues.merchantNames = [...formValues.merchantNames, ...right];
            formValues.merchantMatchTypes = [...formValues.merchantMatchTypes, ...right.map(() => operator)];
        }
    };

    traverseFilters(cardRule.filters);

    return formValues;
}

type SpendRuleByCardID = {
    ruleID: string;
    formValues: SpendRuleForm;
};

/** At most one custom spend rule should reference a card; returns rule id + form values, or undefined. */
function getSpendRuleByCardID(expensifyCardSettingsCollection: OnyxCollection<ExpensifyCardSettings> | undefined, cardID: string): SpendRuleByCardID | undefined {
    for (const settings of Object.values(expensifyCardSettingsCollection ?? {})) {
        const cardRules = settings?.cardRules;
        if (!cardRules) {
            continue;
        }
        for (const [ruleID, rule] of Object.entries(cardRules)) {
            const formValues = getSpendRuleFormValuesFromCardRule(rule);
            if (formValues?.cardIDs?.includes(cardID)) {
                return {ruleID, formValues};
            }
        }
    }
    return undefined;
}

const MAX_SUMMARY_CHARS = 66;

type MoreCountFormatter = (summary: string, hiddenCount: number, shownCount: number) => string;
type SpendRuleSummaryPart = {
    badgeLabel: string;
    text: string;
    isNeutral?: boolean;
};

function getTruncatedSpendRuleSummary(values: string[] | undefined, formatMoreCount: MoreCountFormatter): string {
    const normalizedValues = (values ?? []).map((value) => value.trim()).filter((value) => value !== '');

    if (!normalizedValues.length) {
        return '';
    }

    let text = '';
    let shownCount = 0;

    for (const value of normalizedValues) {
        const nextText = text ? `${text}, ${value}` : value;
        if (nextText.length > MAX_SUMMARY_CHARS) {
            continue;
        }
        text = nextText;
        shownCount++;
    }

    const hiddenCount = Math.max(normalizedValues.length - shownCount, 0);
    return text ? formatMoreCount(text, hiddenCount, shownCount) : '';
}

function getSpendRuleSummaryParts(
    formValues: SpendRuleForm,
    selectedCurrency: string | undefined,
    actionLabel: string,
    translate: LocalizedTranslate,
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
): SpendRuleSummaryPart[] {
    const summaryParts: SpendRuleSummaryPart[] = [];
    const merchantNames = getTruncatedSpendRuleSummary(formValues.merchantNames, (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}));
    const categories = getTruncatedSpendRuleSummary(
        formValues.categories.map((category) => translate(`workspace.rules.spendRules.categoryOptions.${category}`)),
        (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
    );
    const maxAmount = formValues.maxAmount.trim();

    if (merchantNames) {
        summaryParts.push({badgeLabel: actionLabel, text: `${translate('workspace.rules.spendRules.merchants')}: ${merchantNames}`});
    }

    if (categories) {
        summaryParts.push({badgeLabel: actionLabel, text: `${translate('workspace.rules.spendRules.categories')}: ${categories}`});
    }

    if (maxAmount) {
        summaryParts.push({
            badgeLabel: translate('workspace.rules.spendRules.max'),
            text: `${translate('iou.amount')}: ${convertToDisplayString(convertToBackendAmount(Number.parseFloat(maxAmount)), selectedCurrency ?? CONST.CURRENCY.USD)}`,
            isNeutral: true,
        });
    }

    return summaryParts;
}

function getSpendRuleSummaryText(
    formValues: SpendRuleForm,
    cardCurrency: string | undefined,
    translate: LocalizedTranslate,
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
) {
    const action = formValues.restrictionAction;
    const merchantSummary = formValues.merchantNames
        ? getTruncatedSpendRuleSummary(formValues.merchantNames, (merchants, hiddenCount, shownCount) =>
              translate('workspace.rules.spendRules.summaryMerchants', {merchants, hiddenCount, shownCount, action}),
          )
        : undefined;
    const categoryNames = formValues.categories.map((category) => translate(`workspace.rules.spendRules.categoryOptions.${category}`));
    const categorySummary =
        categoryNames.length > 0
            ? getTruncatedSpendRuleSummary(categoryNames, (categories, hiddenCount, shownCount) =>
                  translate('workspace.rules.spendRules.summaryCategories', {categories, hiddenCount, shownCount, action}),
              )
            : undefined;
    const amountSummary =
        formValues.maxAmount.trim() !== ''
            ? `${translate('workspace.rules.spendRules.maxAmount')}: ${convertToDisplayString(convertToBackendAmount(Number.parseFloat(formValues.maxAmount)), cardCurrency ?? CONST.CURRENCY.USD)}`
            : undefined;

    const summaryArray = [];
    if (merchantSummary) {
        summaryArray.push(merchantSummary);
    }

    if (categorySummary) {
        summaryArray.push(categorySummary);
    }

    if (amountSummary) {
        summaryArray.push(amountSummary);
    }

    return summaryArray;
}

export {buildSpendRuleAST, getSpendRuleByCardID, getSpendRuleFormValuesFromCardRule, getSpendRuleSummaryParts, getSpendRuleSummaryText, getTruncatedSpendRuleSummary};
export type {SpendRuleByCardID, SpendRuleSummaryPart};
