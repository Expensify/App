import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';

import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getAgentRuleDisplayTitle} from '@libs/AgentRulesUtils';
import type {AgentRuleWithID} from '@libs/AgentRulesUtils';
import convertToLTR from '@libs/convertToLTR';
import {containsCustomEmoji, containsOnlyCustomEmoji} from '@libs/CustomEmojiUtils';
import Navigation from '@libs/Navigation/Navigation';

import TextWithEmojiFragment from '@pages/inbox/report/comment/TextWithEmojiFragment';

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

type AgentRuleCardProps = {
    policyID: string;
    rule: AgentRuleWithID;

    /** Applies the list's session and permission checks before editing or explaining read-only access. */
    onEditRule: (ruleID: string, pendingAction?: PendingAction) => void;

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

function AgentRuleCard({policyID, rule, onEditRule, menuItemWrapperStyle}: AgentRuleCardProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const textContainerStyle = StyleUtils.getMenuItemTextContainerStyle(false);
    const title = getAgentRuleDisplayTitle(rule);
    const isPendingDelete = rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const titleContainsTextAndCustomEmoji = containsCustomEmoji(title) && !containsOnlyCustomEmoji(title);
    const titleStyle = [styles.flexShrink1, styles.popoverMenuText, styles.pre, isPendingDelete && styles.userSelectNone, styles.ltr, styles.mw100];

    return (
        <OfflineWithFeedback
            key={rule.ruleID}
            pendingAction={rule.pendingAction}
            errors={rule.errors}
            errorRowStyles={styles.agentRulesErrorRow}
            onClose={() => clearPolicyAgentRuleErrors(policyID, rule.ruleID, rule)}
        >
            <MenuItem.Root
                style={[styles.borderedContentCard, styles.ph4, menuItemWrapperStyle]}
                onPress={() => onEditRule(rule.ruleID, rule.pendingAction)}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AGENT_RULE_ITEM}
                isDisabled={isPendingDelete}
                accessibilityLabel={title}
            >
                {/* A row gap would shorten the one-line title, so these two cells stay adjacent. */}
                <View style={[styles.flexRow, styles.pointerEventsAuto]}>
                    <View style={[styles.justifyContentCenter, styles.flex1, textContainerStyle]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100]}>
                            <Text
                                style={titleStyle}
                                numberOfLines={1}
                            >
                                {titleContainsTextAndCustomEmoji ? (
                                    <TextWithEmojiFragment
                                        message={convertToLTR(title) || ''}
                                        style={titleStyle}
                                        alignCustomEmoji
                                    />
                                ) : (
                                    convertToLTR(title)
                                )}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.flexRow, textContainerStyle]}>
                        <MenuItem.Chevron />
                    </View>
                </View>
            </MenuItem.Root>
        </OfflineWithFeedback>
    );
}

export default AgentRulesList;
