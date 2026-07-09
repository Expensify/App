import AgentRulesList from '@components/AgentRules/AgentRulesList';
import useAgentRulesSectionHeader from '@components/AgentRules/useAgentRulesSectionHeader';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {getVisibleAgentRules} from '@libs/AgentRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import React from 'react';

import RulesTabEmptyState from './RulesTabEmptyState';

type RulesAgentsTabProps = {
    policyID: string;
    canWriteRules: boolean;
    showReadOnlyModal: () => void;
};

function RulesAgentsTab({policyID, canWriteRules, showReadOnlyModal}: RulesAgentsTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
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
                <AgentRulesList
                    policyID={policyID}
                    rules={visibleRules}
                    canWriteRules={canWriteRules}
                    showReadOnlyModal={showReadOnlyModal}
                    listContainerStyle={[styles.mt6, styles.gap2]}
                    menuItemWrapperStyle={styles.justifyContentCenter}
                />
            </Section>
        </ScrollView>
    );
}

export default RulesAgentsTab;
