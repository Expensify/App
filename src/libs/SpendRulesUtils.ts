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

type SpendRuleValues = {
    cardIDs?: string[];
    maxAmount?: string;
    categories?: string[];
    merchantNames?: string[];
    currencies?: string[];
    restrictionAction?: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
    merchantMatchTypes?: Array<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>;
};

function buildSpendRuleAST(spendRuleValues: SpendRuleValues, existingCreated?: string): ExpensifyCardRule | undefined {
    const merchantNames = (spendRuleValues.merchantNames ?? []).map((merchant) => merchant.trim()).filter((merchant) => merchant !== '');
    const merchantMatchTypes = spendRuleValues.merchantMatchTypes ?? [];
    const currencies = spendRuleValues.currencies ?? [];
    const categories = (spendRuleValues.categories ?? []).map((category) => category.trim()).filter((category) => category !== '');
    const maxAmount = spendRuleValues.maxAmount?.trim() ?? '';

    const cardIDs = spendRuleValues.cardIDs ?? [];
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

    const currencyNode =
        currencies.length > 0
            ? {
                  left: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
                  operator: spendRuleValues.restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK ? CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO : CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                  right: currencies,
              }
            : undefined;

    const criteriaNode = combineSpendRuleASTNodes([merchantNode, categoryNode, currencyNode].filter(Boolean) as ExpensifyCardRuleFilter[], CONST.SEARCH.SYNTAX_OPERATORS.OR);
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

    const filters = cardIDs.length > 0 ? combineSpendRuleASTNodes([cardNode, ruleNode].filter(Boolean) as ExpensifyCardRuleFilter[], CONST.SEARCH.SYNTAX_OPERATORS.AND) : ruleNode;

    if (!filters) {
        return undefined;
    }

    return {
        created: existingCreated ?? DateUtils.getDBTime(),
        action: spendRuleValues.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW,
        filters,
    };
}

function getSpendRuleFormValuesFromCardRule(cardRule?: ExpensifyCardRule): SpendRuleForm | undefined {
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
        currencies: [],
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

        if (typeof left !== 'string') {
            return;
        }

        const rightValues = [right].flat();

        if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID) {
            formValues.cardIDs = rightValues;
            return;
        }

        if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT) {
            formValues.maxAmount = rightValues.at(0) ?? '';
            return;
        }

        if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY) {
            formValues.categories = rightValues.filter(isSpendRuleCategory);
            return;
        }

        if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY) {
            formValues.currencies = rightValues;
            return;
        }

        if (left === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT) {
            formValues.merchantNames = [...formValues.merchantNames, ...rightValues];
            formValues.merchantMatchTypes = [...formValues.merchantMatchTypes, ...rightValues.map(() => operator)];
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
    variant: 'neutral' | 'success' | 'error';
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
    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>,
    formValues: SpendRuleForm,
    selectedCurrency: string | undefined,
    translate: LocalizedTranslate,
    convertToDisplayString: CurrencyListActionsContextType['convertToDisplayString'],
): SpendRuleSummaryPart[] {
    const summaryParts: SpendRuleSummaryPart[] = [];
    const blockLabel = translate('workspace.rules.spendRules.block');
    const allowLabel = translate('workspace.rules.spendRules.allow');

    const maxAmount = formValues.maxAmount.trim();
    const allowedCurrencies = formValues.currencies ?? [];
    const merchantNames = getTruncatedSpendRuleSummary(formValues.merchantNames, (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}));
    const categories = getTruncatedSpendRuleSummary(
        formValues.categories.map((category) => translate(`workspace.rules.spendRules.categoryOptions.${category}`)),
        (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
    );

    const actionVariant = action === CONST.SPEND_RULES.ACTION.BLOCK ? 'error' : 'success';
    const actionLabel = action === CONST.SPEND_RULES.ACTION.BLOCK ? blockLabel : allowLabel;

    if (merchantNames) {
        summaryParts.push({
            variant: actionVariant,
            badgeLabel: actionLabel,
            text: `${translate('workspace.rules.spendRules.merchants')}: ${merchantNames}`,
        });
    }

    if (categories) {
        summaryParts.push({
            variant: actionVariant,
            badgeLabel: actionLabel,
            text: `${translate('workspace.rules.spendRules.categories')}: ${categories}`,
        });
    }

    if (allowedCurrencies.length > 0) {
        summaryParts.push({
            variant: 'success',
            badgeLabel: allowLabel,
            text: `${translate('workspace.rules.spendRules.currencies')}: ${allowedCurrencies.join(', ')}`,
        });
    }

    if (maxAmount) {
        summaryParts.push({
            variant: 'neutral',
            badgeLabel: translate('workspace.rules.spendRules.max'),
            text: `${translate('iou.amount')}: ${convertToDisplayString(convertToBackendAmount(Number.parseFloat(maxAmount)), selectedCurrency ?? CONST.CURRENCY.USD)}`,
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

export type {SpendRuleSummaryPart};
export {buildSpendRuleAST, getSpendRuleByCardID, getSpendRuleFormValuesFromCardRule, getSpendRuleSummaryParts, getSpendRuleSummaryText, getTruncatedSpendRuleSummary};
