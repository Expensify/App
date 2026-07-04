import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {AgentRule} from '@src/types/onyx/Policy';

import Navigation from './Navigation/Navigation';

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

function getAgentRuleNavigationRoute(policyID: string, ruleID: string): Route {
    return ROUTES.RULES_AGENT_EDIT.getRoute(policyID, ruleID);
}

function navigateToAgentRuleEdit(policyID: string, ruleID: string) {
    Navigation.navigate(getAgentRuleNavigationRoute(policyID, ruleID));
}

function navigateToNewAgentRule(policyID: string) {
    Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID));
}

function navigateToAgentsTab(policyID: string) {
    Navigation.goBack(ROUTES.WORKSPACE_RULES.getRoute(policyID));
}

export {getAgentRuleDisplayTitle, getAgentRuleNavigationRoute, getSortedAgentRules, getVisibleAgentRules, navigateToAgentRuleEdit, navigateToAgentsTab, navigateToNewAgentRule};
export type {AgentRuleWithID};
