import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import ROUTES from '@src/ROUTES';
import type {SpendRuleForm} from '@src/types/form';

const MAX_SUMMARY_CHARS = 74;

type MoreCountFormatter = (summary: string, count: number) => string;
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
    return text && hiddenCount > 0 ? formatMoreCount(text, hiddenCount) : text;
}

function getParentRoute(policyID: string, ruleID: string) {
    return ruleID === ROUTES.NEW ? ROUTES.RULES_SPEND_NEW.getRoute(policyID) : ROUTES.RULES_SPEND_EDIT.getRoute(policyID, ruleID);
}

function getSpendRuleSummaryParts(formValues: SpendRuleForm, selectedCurrency: string | undefined, actionLabel: string, translate: LocalizedTranslate): SpendRuleSummaryPart[] {
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

export {getParentRoute, getSpendRuleSummaryParts, getTruncatedSpendRuleSummary};
export type {SpendRuleSummaryPart};
