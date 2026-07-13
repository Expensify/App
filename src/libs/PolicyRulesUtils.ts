import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';

import StringUtils from './StringUtils';

type SuggestedAgentRuleIcon = 'ThumbsUp' | 'CircleSlash' | 'Flag' | 'Coins';

type SuggestedAgentRuleIconRule = {
    /** Icon to show when any keyword matches */
    icon: Exclude<SuggestedAgentRuleIcon, 'ThumbsUp'>;

    /** Higher priority wins when multiple rules match the same suggestion. */
    priority: number;

    /** keywords matched against suggestion id + title */
    keywords: readonly string[];
};

/** Fallback when no keyword rule matches */
const DEFAULT_SUGGESTED_AGENT_RULE_ICON: SuggestedAgentRuleIcon = 'ThumbsUp';

/**
 * Backend suggestions are {id, title, prompt} only. Icons are derived from id + title.
 * Keywords are matched as whole tokens so substrings like "age"/"cap" do not match "manage"/"capital".
 */

const SUGGESTED_AGENT_RULE_ICON_RULES = [
    {
        icon: 'Flag',
        priority: 1,
        keywords: ['flag', 'flagged', 'mismatch', 'empty', 'mixed', 'age', 'weekend', 'suspected', 'unusually', 'within', 'window', 'deadline'],
    },
    {
        icon: 'Coins',
        priority: 2,
        keywords: ['amount', 'total', 'cap', 'tip', 'currency', 'limit'],
    },
    {
        icon: 'CircleSlash',
        priority: 3,
        keywords: ['block', 'banned', 'blocked', 'alcohol', 'gift-card', 'personal', 'ai-generated', 'handwritten', 'incorrect-receipt'],
    },
] as const satisfies readonly SuggestedAgentRuleIconRule[];

const SUGGESTED_AGENT_RULE_ICON_NAMES = [DEFAULT_SUGGESTED_AGENT_RULE_ICON, ...SUGGESTED_AGENT_RULE_ICON_RULES.map((rule) => rule.icon)] as const;

function isPendingDeleteOrUpdate(pendingAction: PendingAction | undefined): boolean {
    return pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
}

function getMccGroupDisplayName(groupID: string): string {
    return groupID.charAt(0).toUpperCase() + groupID.slice(1);
}

/**
 * Returns true when keyword appears as a whole token in text.
 */
function textIncludesKeywordToken(text: string, keyword: string): boolean {
    return new RegExp(`(?:^|[^a-z0-9])${StringUtils.escapeRegExp(keyword)}(?:$|[^a-z0-9])`).test(text);
}

function getSuggestedAgentRuleIcon(suggestion: SuggestedAgentRule): SuggestedAgentRuleIcon {
    const text = `${suggestion.id} ${suggestion.title}`.toLowerCase();
    let bestMatchingRule: SuggestedAgentRuleIconRule | undefined;

    for (const rule of SUGGESTED_AGENT_RULE_ICON_RULES) {
        const hasKeywordMatch = rule.keywords.some((keyword) => textIncludesKeywordToken(text, keyword));
        if (!hasKeywordMatch) {
            continue;
        }
        if (!bestMatchingRule || rule.priority > bestMatchingRule.priority) {
            bestMatchingRule = rule;
        }
    }

    return bestMatchingRule?.icon ?? DEFAULT_SUGGESTED_AGENT_RULE_ICON;
}

export {getMccGroupDisplayName, getSuggestedAgentRuleIcon, isPendingDeleteOrUpdate, SUGGESTED_AGENT_RULE_ICON_NAMES};
