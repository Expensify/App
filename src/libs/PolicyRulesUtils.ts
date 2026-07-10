import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';

type SuggestedAgentRuleIcon = 'ThumbsUp' | 'CircleSlash' | 'Flag' | 'Coins';

/**
 * Backend suggestions are {id, title, prompt} only, so Suggestions-tab icons are derived from copy.
 * Unmatched suggestions fall back to ThumbsUp.
 */
const SUGGESTED_AGENT_RULE_ICON_RULES = [
    {icon: 'CircleSlash', keywords: ['block', 'prohibit', 'reject']},
    {icon: 'Flag', keywords: ['flag']},
    {icon: 'Coins', keywords: ['limit', '/night', 'hotel']},
] as const satisfies ReadonlyArray<{icon: SuggestedAgentRuleIcon; keywords: readonly string[]}>;

function isPendingDeleteOrUpdate(pendingAction: PendingAction | undefined): boolean {
    return pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
}

function getMccGroupDisplayName(groupID: string): string {
    return groupID.charAt(0).toUpperCase() + groupID.slice(1);
}

function getSuggestedAgentRuleIcon(suggestion: SuggestedAgentRule): SuggestedAgentRuleIcon {
    const text = `${suggestion.title} ${suggestion.prompt}`.toLowerCase();

    for (const rule of SUGGESTED_AGENT_RULE_ICON_RULES) {
        if (rule.keywords.some((keyword) => text.includes(keyword))) {
            return rule.icon;
        }
    }

    return 'ThumbsUp';
}

export {getMccGroupDisplayName, getSuggestedAgentRuleIcon, isPendingDeleteOrUpdate};
export type {SuggestedAgentRuleIcon};
