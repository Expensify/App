import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {AgentRule} from '@src/types/onyx/Policy';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

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

/** The first of the given policies on which the given account is the RuleBot agent enforcing Agent rules, if any. */
function getRuleBotEnforcedPolicy(accountID: number | undefined, policies: OnyxCollection<Policy>): OnyxEntry<Policy> {
    if (!accountID) {
        return undefined;
    }
    return Object.values(policies ?? {}).find((policy) => isRuleBotEnforcingRules(accountID, policy)) ?? undefined;
}

/** Whether the given account is the RuleBot agent enforcing Agent rules on any of the given policies. Such an account can't be deleted until its rules are removed. */
function isRuleBotEnforcingRulesOnAnyPolicy(accountID: number | undefined, policies: OnyxCollection<Policy>): boolean {
    return !!getRuleBotEnforcedPolicy(accountID, policies);
}

export {getAgentRuleDisplayTitle, getVisibleAgentRules, getRuleBotEnforcedPolicy, isRuleBotEnforcingRules, isRuleBotEnforcingRulesOnAnyPolicy};
export type {AgentRuleWithID};
