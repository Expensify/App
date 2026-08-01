import AgentRulesList from '@components/AgentRules/AgentRulesList';
import useAgentRulesSectionHeader from '@components/AgentRules/useAgentRulesSectionHeader';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getVisibleAgentRules} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type RulesAgentsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    showReadOnlyModal: () => void;
};

function RulesAgentsTab({policyID, canWriteRules, showReadOnlyModal}: RulesAgentsTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const illustrations = useMemoizedLazyIllustrations(['AgentsIceCream']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const visibleRules = getVisibleAgentRules(policy?.rules?.agentRules, isOffline);
    const hasRules = visibleRules.length > 0;
    const {renderTitle, renderSubtitle} = useAgentRulesSectionHeader({
        policyID,
        subtitle: translate('workspace.rules.agentRules.revampSubtitle'),
    });

    const handleAddAgentRule = () => {
        if (!canWriteRules) {
            showReadOnlyModal();
            return;
        }

        Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID));
    };

    if (!hasRules) {
        return (
            <ScrollView
                style={[styles.flex1, styles.mnh0]}
                contentContainerStyle={[styles.flexGrow1, styles.flexShrink0, styles.justifyContentCenter, styles.w100]}
                addBottomSafeAreaPadding
            >
                <GenericEmptyStateComponent
                    headerMedia={illustrations.AgentsIceCream}
                    headerStyles={styles.emptyStateCardIllustrationContainer}
                    headerContentStyles={styles.agentsRulesEmptyStateIllustration}
                    title={translate('workspace.rules.agentRulesEmptyState.title')}
                    subtitle={translate('workspace.rules.agentRulesEmptyState.subtitle')}
                    subtitleStyles={[styles.textLabel, styles.textSupporting]}
                    minModalHeight={0}
                    cardContentStyles={styles.ph0}
                    containerStyles={[styles.alignItemsCenter, styles.w100, styles.alignSelfCenter, StyleUtils.getMaximumWidth(variables.cardRulesEmptyStateMaxWidth)]}
                    buttons={[
                        {
                            buttonText: translate('workspace.rules.agentRulesEmptyState.cta'),
                            buttonAction: handleAddAgentRule,
                            success: true,
                            icon: icons.Plus,
                            isDisabled: !canWriteRules,
                        },
                    ]}
                />
            </ScrollView>
        );
    }

    return (
        <ScrollView
            style={[styles.flex1, styles.mnh0]}
            contentContainerStyle={[styles.flexGrow1, styles.w100]}
            addBottomSafeAreaPadding
        >
            <View style={[styles.w100, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <Section
                    isCentralPane
                    renderTitle={renderTitle}
                    renderSubtitle={renderSubtitle}
                    containerStyles={styles.mh5}
                >
                    <AgentRulesList
                        policyID={policyID}
                        rules={visibleRules}
                        canWriteRules={canWriteRules}
                        showReadOnlyModal={showReadOnlyModal}
                        listContainerStyle={[styles.mt6, styles.gap2]}
                        menuItemWrapperStyle={styles.justifyContentCenter}
                    />
                </Section>
            </View>
        </ScrollView>
    );
}

export default RulesAgentsTab;
