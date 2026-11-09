import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getAgentRuleDisplayTitle} from '@libs/AgentRulesUtils';
import type {AgentRuleWithID} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import {clearPolicyAgentRuleErrors} from '@userActions/Policy/Rules';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';

import {authTokenTypeSelector} from '@selectors/Session';
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
                <OfflineWithFeedback
                    key={rule.ruleID}
                    pendingAction={rule.pendingAction}
                    errors={rule.errors}
                    errorRowStyles={styles.agentRulesErrorRow}
                    onClose={() => clearPolicyAgentRuleErrors(policyID, rule.ruleID, rule)}
                >
                    <MenuItem.Root
                        style={[styles.borderedContentCard, styles.ph4, menuItemWrapperStyle]}
                        onPress={() => editAgentRule(rule.ruleID, rule.pendingAction)}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AGENT_RULE_ITEM}
                        isDisabled={rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                    >
                        <MenuItem.Row>
                            <MenuItem.Content>
                                <MenuItem.Title style={styles.fontWeightNormal}>{getAgentRuleDisplayTitle(rule)}</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                </OfflineWithFeedback>
            ))}
        </View>
    );
}

export default AgentRulesList;
