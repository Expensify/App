import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import UserPill from '@components/UserPill';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getAgentRuleDisplayTitle, getVisibleAgentRules, navigateToAgentRuleEdit, navigateToNewAgentRule} from '@libs/AgentRulesUtils';
import {isPolicyMemberWithoutPendingDelete} from '@libs/PolicyUtils';

import {clearPolicyAgentRuleErrors} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';
import {View} from 'react-native';

import RulesTabEmptyState from './RulesTabEmptyState';

type RulesAgentsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    showReadOnlyModal: () => void;
};

function RulesAgentsTab({policyID, canWriteRules, showReadOnlyModal}: RulesAgentsTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const personalDetailsList = usePersonalDetails();
    const illustrations = useMemoizedLazyIllustrations(['AiBot']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const agentRules = policy?.rules?.agentRules;
    const hasRules = !isEmptyObject(agentRules);
    const visibleRules = getVisibleAgentRules(agentRules, isOffline);

    const ruleBotAccountID = policy?.ruleBotAccountID;
    const ruleBot = ruleBotAccountID ? personalDetailsList?.[ruleBotAccountID] : undefined;
    const ruleBotDisplayName = ruleBot?.displayName ?? ruleBot?.login ?? translate('workspace.rules.agentRules.ruleBotName');
    const isRuleBotActiveMember = isPolicyMemberWithoutPendingDelete(ruleBot?.login, policy);

    const handleAddAgentRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }

        navigateToNewAgentRule(policyID);
    };

    const handleEditAgentRule = (ruleID: string, pendingAction?: PendingAction) => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }

        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        navigateToAgentRuleEdit(policyID, ruleID);
    };

    if (!hasRules) {
        return (
            <RulesTabEmptyState
                illustration={illustrations.AiBot}
                headerContentStyles={styles.sortingMachineRulesEmptyStateIllustration}
                title={translate('workspace.rules.agentRulesEmptyState.title')}
                subtitle={translate('workspace.rules.agentRulesEmptyState.subtitle')}
                buttonText={translate('workspace.rules.agentRulesEmptyState.cta')}
                onPress={handleAddAgentRule}
                isDisabled={!canWriteRules}
            />
        );
    }

    return (
        <ScrollView
            style={[styles.flex1, styles.mnh0]}
            contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}
            addBottomSafeAreaPadding
        >
            <View style={[styles.borderedContentCard, styles.pv4, styles.ph4, styles.gap3, styles.mt3]}>
                <View style={styles.gap2}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                        <Text style={[styles.textHeadline, styles.textStrong, {color: theme.text}]}>{translate('workspace.rules.agentRules.title')}</Text>
                        <Badge
                            text={translate('common.beta')}
                            isCondensed
                            success
                        />
                    </View>
                    <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.agentRules.revampSubtitle')}</Text>
                    {!!ruleBotAccountID && isRuleBotActiveMember && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1Half, styles.flexWrap]}>
                            <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.agentRules.enforcedBy')}</Text>
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
                <View style={styles.gap2}>
                    {visibleRules.map((rule) => (
                        <OfflineWithFeedback
                            key={rule.ruleID}
                            pendingAction={rule.pendingAction}
                            errors={rule.errors}
                            onClose={() => clearPolicyAgentRuleErrors(policyID, rule.ruleID, rule)}
                        >
                            <MenuItemWithTopDescription
                                title={getAgentRuleDisplayTitle(rule)}
                                numberOfLinesTitle={1}
                                wrapperStyle={[styles.componentBG, styles.ph4, styles.pv2, styles.borderRadiusNormal]}
                                shouldShowRightIcon
                                onPress={() => handleEditAgentRule(rule.ruleID, rule.pendingAction)}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AGENT_RULE_ITEM}
                                disabled={rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                            />
                        </OfflineWithFeedback>
                    ))}
                </View>
                <MenuItem
                    title={translate('workspace.rules.agentRules.addAgentRuleCta')}
                    titleStyle={styles.textStrong}
                    icon={icons.Plus}
                    iconHeight={20}
                    iconWidth={20}
                    style={[styles.sectionMenuItemTopDescription, styles.mbn3, !canWriteRules && styles.buttonOpacityDisabled]}
                    onPress={handleAddAgentRule}
                    disabled={!canWriteRules}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.ADD_AGENT_RULE}
                />
            </View>
        </ScrollView>
    );
}

export default RulesAgentsTab;
