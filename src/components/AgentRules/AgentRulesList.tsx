import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useThemeStyles from '@hooks/useThemeStyles';

import {getAgentRuleDisplayTitle, type AgentRuleWithID} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import {clearPolicyAgentRuleErrors} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type AgentRulesListProps = {
    policyID: string;
    rules: AgentRuleWithID[];
    canWriteRules: boolean;
    showReadOnlyModal: () => void;
    listContainerStyle?: StyleProp<ViewStyle>;
    menuItemWrapperStyle?: StyleProp<ViewStyle>;
};

function AgentRulesList({policyID, rules, canWriteRules, showReadOnlyModal, listContainerStyle, menuItemWrapperStyle}: AgentRulesListProps) {
    const styles = useThemeStyles();

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

    return (
        <View style={listContainerStyle}>
            {rules.map((rule) => (
                <OfflineWithFeedback
                    key={rule.ruleID}
                    pendingAction={rule.pendingAction}
                    errors={rule.errors}
                    errorRowStyles={styles.agentRulesErrorRow}
                    onClose={() => clearPolicyAgentRuleErrors(policyID, rule.ruleID, rule)}
                >
                    <MenuItemWithTopDescription
                        title={getAgentRuleDisplayTitle(rule)}
                        numberOfLinesTitle={1}
                        wrapperStyle={[styles.borderedContentCard, styles.ph4, menuItemWrapperStyle]}
                        shouldShowRightIcon
                        onPress={() => handleEditAgentRule(rule.ruleID, rule.pendingAction)}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AGENT_RULE_ITEM}
                        disabled={rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                    />
                </OfflineWithFeedback>
            ))}
        </View>
    );
}

export default AgentRulesList;
