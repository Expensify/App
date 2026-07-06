import Badge from '@components/Badge';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import UserPill from '@components/UserPill';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
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
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

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
    const illustrations = useMemoizedLazyIllustrations(['AgentsIceCream']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const agentRules = policy?.rules?.agentRules;
    const visibleRules = getVisibleAgentRules(agentRules, isOffline);
    const hasRules = visibleRules.length > 0;

    const ruleBotAccountID = policy?.ruleBotAccountID;
    const ruleBot = ruleBotAccountID ? personalDetailsList?.[ruleBotAccountID] : undefined;
    const ruleBotDisplayName = ruleBot?.displayName ?? ruleBot?.login ?? translate('workspace.rules.agentRules.ruleBotName');
    const isRuleBotActiveMember = isPolicyMemberWithoutPendingDelete(ruleBot?.login, policy);

    const handleAddAgentRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }

        Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID));
    };

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

    if (!hasRules) {
        return (
            <RulesTabEmptyState
                illustration={illustrations.AgentsIceCream}
                headerContentStyles={styles.agentsRulesEmptyStateIllustration}
                title={translate('workspace.rules.agentRulesEmptyState.title')}
                subtitle={translate('workspace.rules.agentRulesEmptyState.subtitle')}
                buttonText={translate('workspace.rules.agentRulesEmptyState.cta')}
                buttonIcon={icons.Plus}
                onPress={handleAddAgentRule}
                isDisabled={!canWriteRules}
            />
        );
    }

    const renderTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.agentRules.title')}</Text>
            <Badge
                text={translate('common.beta')}
                success
            />
        </View>
    );

    const renderSubtitle = () => (
        <View style={[styles.mt2, styles.gap2]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.agentRules.revampSubtitle')}</Text>
            {!!ruleBotAccountID && isRuleBotActiveMember && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1Half, styles.flexWrap]}>
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
        <ScrollView
            style={[styles.flex1, styles.mnh0]}
            contentContainerStyle={styles.flexGrow1}
            addBottomSafeAreaPadding
        >
            <Section
                isCentralPane
                renderTitle={renderTitle}
                renderSubtitle={renderSubtitle}
                containerStyles={styles.mh5}
            >
                <View style={[styles.mt6, styles.gap2]}>
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
                                wrapperStyle={[styles.borderedContentCard, styles.ph4, styles.justifyContentCenter]}
                                shouldShowRightIcon
                                onPress={() => handleEditAgentRule(rule.ruleID, rule.pendingAction)}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AGENT_RULE_ITEM}
                                disabled={rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                            />
                        </OfflineWithFeedback>
                    ))}
                </View>
            </Section>
        </ScrollView>
    );
}

export default RulesAgentsTab;
