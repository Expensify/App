import useOnyx from '@hooks/useOnyx';

import type {AgentRuleWithID} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';

import AgentRuleCard from './AgentRuleCard';

type AgentRulesListProps = {
    policyID: string;
    rules: AgentRuleWithID[];
    canWriteRules: boolean;
    showReadOnlyModal: () => void;
    listContainerStyle?: StyleProp<ViewStyle>;
    menuItemWrapperStyle?: StyleProp<ViewStyle>;
};

function AgentRulesList({policyID, rules, canWriteRules, showReadOnlyModal, listContainerStyle, menuItemWrapperStyle}: AgentRulesListProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    const handleEditAgentRule = (ruleID: string, pendingAction?: PendingAction) => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }

        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        Navigation.navigate(ROUTES.RULES_AGENT_EDIT.getRoute(policyID, ruleID));
    };
    const editAgentRule = callFunctionIfActionIsAllowed(handleEditAgentRule, false, session);

    return (
        <View style={listContainerStyle}>
            {rules.map((rule) => (
                <AgentRuleCard
                    key={rule.ruleID}
                    policyID={policyID}
                    rule={rule}
                    onEditRule={editAgentRule}
                    menuItemWrapperStyle={menuItemWrapperStyle}
                />
            ))}
        </View>
    );
}

export default AgentRulesList;
