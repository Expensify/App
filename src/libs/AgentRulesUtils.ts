import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {AgentRule} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

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
    if (isOffline) {
        return getSortedAgentRules(agentRules);
    }

    return getSortedAgentRules(agentRules).filter((rule) => rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

function hasAgentRules(policy: OnyxEntry<Policy>): boolean {
    return Object.values(policy?.rules?.agentRules ?? {}).some((rule) => !!rule && rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

/** Whether the given account is the RuleBot agent enforcing Agent rules on the policy. Such an account can't be removed until its rules are deleted. */
function isRuleBotEnforcingRules(accountID: number | undefined, policy: OnyxEntry<Policy>): boolean {
    return !!accountID && policy?.ruleBotAccountID === accountID && hasAgentRules(policy);
}

export {getAgentRuleDisplayTitle, getVisibleAgentRules, hasAgentRules, isRuleBotEnforcingRules};
export type {AgentRuleWithID};
