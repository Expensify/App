import CONST from '@src/CONST';
import type {AgentRule} from '@src/types/onyx/Policy';

type AgentRulesCollection = Record<string, AgentRule> | undefined;

type AgentRuleWithID = AgentRule & {
    ruleID: string;
};

function getAgentRuleDisplayTitle(rule: AgentRule): string {
    return (rule.title ?? rule.prompt).replaceAll(/\s+/g, ' ').trim();
}

function getSortedAgentRules(agentRules: AgentRulesCollection): AgentRuleWithID[] {
    return Object.entries(agentRules ?? {})
        .filter(([, rule]) => !!rule)
        .map(([ruleID, rule]) => ({...rule, ruleID}))
        .sort((a, b) => {
            if (a.created && b.created) {
                return a.created < b.created ? 1 : -1;
            }

            return 0;
        });
}

function getVisibleAgentRules(agentRules: AgentRulesCollection, isOffline: boolean): AgentRuleWithID[] {
    return getSortedAgentRules(agentRules).filter((rule) => isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

export {getAgentRuleDisplayTitle, getVisibleAgentRules};
export type {AgentRuleWithID};
