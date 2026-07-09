import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import Section from '@components/Section';
import Text from '@components/Text';
import UserPill from '@components/UserPill';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getAgentRuleDisplayTitle, getVisibleAgentRules} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyMemberWithoutPendingDelete} from '@libs/PolicyUtils';

import {clearPolicyAgentRuleErrors} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type AgentRulesSectionProps = {
    policyID: string;
    canWriteRules: boolean;
    showReadOnlyModal: () => void;
};

function AgentRulesSection({policyID, canWriteRules, showReadOnlyModal}: AgentRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const personalDetailsList = usePersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const agentRules = policy?.rules?.agentRules;
    const visibleRules = getVisibleAgentRules(agentRules, isOffline);
    const hasRules = visibleRules.length > 0;

    // RuleBot is the agent the backend provisions on the first Agent rule and stores on the policy.
    const ruleBotAccountID = policy?.ruleBotAccountID;
    const ruleBot = ruleBotAccountID ? personalDetailsList?.[ruleBotAccountID] : undefined;
    const ruleBotDisplayName = ruleBot?.displayName ?? ruleBot?.login ?? translate('workspace.rules.agentRules.ruleBotName');

    // ruleBotAccountID stays set on the policy after RuleBot is removed from the workspace, so also require it to still be an active member before showing the "enforced by" line.
    const isRuleBotActiveMember = isPolicyMemberWithoutPendingDelete(ruleBot?.login, policy);

    const renderTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.agentRules.title')}</Text>
            <Badge
                text={translate('common.beta')}
                isCondensed
                success
            />
        </View>
    );

    const renderSubtitle = () => (
        <View style={[styles.mt2, styles.gap2]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.agentRules.subtitle')}</Text>
            {!!ruleBotAccountID && isRuleBotActiveMember && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1Half]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.agentRules.enforcedBy')}</Text>
                    <UserPill
                        accountID={ruleBotAccountID}
                        avatar={ruleBot?.avatar}
                        displayName={ruleBotDisplayName}
                        email={ruleBot?.login}
                        style={styles.flexShrink1}
                    />
                </View>
            )}
        </View>
    );

    return (
        <Section
            isCentralPane
            renderTitle={renderTitle}
            renderSubtitle={renderSubtitle}
            childrenStyles={[styles.gap3]}
        >
            {hasRules && (
                <View style={[styles.mt3, styles.gap2]}>
                    {visibleRules.map((rule) => {
                        return (
                            <View key={rule.ruleID}>
                                <OfflineWithFeedback
                                    pendingAction={rule.pendingAction}
                                    errors={rule.errors}
                                    errorRowStyles={styles.agentRulesErrorRow}
                                    onClose={() => clearPolicyAgentRuleErrors(policyID, rule.ruleID, rule)}
                                >
                                    <MenuItemWithTopDescription
                                        title={getAgentRuleDisplayTitle(rule)}
                                        numberOfLinesTitle={1}
                                        wrapperStyle={[styles.borderedContentCard, styles.ph4, styles.pv2]}
                                        shouldShowRightIcon
                                        onPress={() => {
                                            if (!canWriteRules) {
                                                showReadOnlyModal();
                                                return;
                                            }
                                            Navigation.navigate(ROUTES.RULES_AGENT_EDIT.getRoute(policyID, rule.ruleID));
                                        }}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AGENT_RULE_ITEM}
                                        disabled={rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                                    />
                                </OfflineWithFeedback>
                            </View>
                        );
                    })}
                </View>
            )}
            <MenuItem
                title={translate('workspace.rules.agentRules.addRule')}
                titleStyle={styles.textStrong}
                icon={expensifyIcons.Plus}
                iconHeight={20}
                iconWidth={20}
                style={[styles.sectionMenuItemTopDescription, !hasRules && styles.mt6, styles.mbn3, !canWriteRules && styles.buttonOpacityDisabled]}
                onPress={() => {
                    if (!canWriteRules) {
                        showReadOnlyModal();
                        return;
                    }
                    Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID));
                }}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.ADD_AGENT_RULE}
            />
        </Section>
    );
}

export default AgentRulesSection;
