import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

const MAX_SUMMARY_CHARS = 74;

type MoreCountFormatter = (summary: string, count: number) => string;

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

function getParentRoute(policyID: string, ruleID: string): Route {
    return ruleID === ROUTES.NEW ? ROUTES.RULES_SPEND_NEW.getRoute(policyID) : ROUTES.RULES_SPEND_EDIT.getRoute(policyID, ruleID);
}

export {getTruncatedSpendRuleSummary, getParentRoute};
